const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const mySSVideo = document.getElementById("ssvideo");
const myReSSVideo = document.getElementById("ssremvideo");
$("#ssvideo").hide();
$("#ssremvideo").hide();
var local_stream;

myVideo.muted = true;
var currentPeer = null
var screenStream;
var screenSharing = false
// var peer = new Peer({
//   host: "0.peerjs.com",
//   port: 443,
//   path: "/",
//   pingInterval: 5000,
// });

const peer = new Peer(undefined, {
  host: "https://live.softnetworld.in/",
  port: 443,
  path: "/peer",
});

let myVideoStream;
const peers = {}

var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
   // setRemoteStream(stream);
    peer.on("call", (call) => {
      call.answer(stream);   
       
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
        //setRemoteStream(userVideoStream) // remote  
      });
      currentPeer = call;
    });

    socket.on("user-connected", (userVId) => {
      
      connectToNewUser(userVId, stream);
      
    });

    document.addEventListener("keydown", (e) => {
      var url = new URL(window.location.href);
      var username = url.searchParams.get("authUser");
      var email = url.searchParams.get("email");
      var user_id = url.searchParams.get("user_id");
      if (e.which === 13 && chatInputBox.value != "") {
        console.log(username)
        var data = {};
        data.msgId = ROOM_ID;
        data.msg = chatInputBox.value;
        data.username = username;
        data.email = email;
        data.userId = user_id;
        console.log(JSON.stringify(data))
        $.ajax({
          url: 'https://live.softnetworld.in/message',
         // url: 'http://localhost:3030/message',
          type: 'POST',
          contentType: 'application/json',
          dataType: "json",
          cache: false,
          data: JSON.stringify(data),
          success: function (data) {
            //alert('Success!')
          }
          , error: function (jqXHR, textStatus, err) {
            alert('text status ' + textStatus + ', err ' + err)
          }
        })
        socket.emit("message", username + " : " + chatInputBox.value);
        chatInputBox.value = "";
      }
    });

    socket.on("createMessage", (msg) => {
      console.log(msg);
      // alert(msg);
      // addScreenShareVideoStream(myReSSVideo, myVideoStream);
      // if(msg=='popup'){
      //   $("#ssvideo").show();
      //   $("#ssremvideo").hide();
       

      // }
      let li = document.createElement("li");
      li.innerHTML = msg;
      all_messages.append(li);
      main__chat__window.scrollTop = main__chat__window.scrollHeight;
    });
    socket.on("participantsCount", (count) => {
      console.log(count);
     // alert(count)
      // alert(msg);
      // addScreenShareVideoStream(myReSSVideo, myVideoStream);
      // if(msg=='popup'){
      //   $("#ssvideo").show();
      //   $("#ssremvideo").hide();
       
  
      // }
      const html = count;
    document.getElementById("countParticipants").innerHTML = html;
    });
  });
  
socket.on('user-disconnected', userVId => {
  if (peers[userVId]) peers[userVId].close()
})

peer.on("call", function (call) {
  getUserMedia({ video: true, audio: true },
    function (stream) {
      call.answer(stream); // Answer the call with an A/V stream.
      //setRemoteStream(stream);      
      const video = document.createElement("video");
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);        
      });
      currentPeer = call;
    },
    function (err) {
      console.log("Failed to get local stream", err);
    });
});


// var peerUserId
// if(peerUserId === null){
//   peer.on("open", (id) => {
//     peerUserId = id
//     console.log(peerUserId)
//     socket.emit("join-room", ROOM_ID, id);
//   });

// }else{

//     socket.emit("join-room", ROOM_ID, peerUserId);


//}

peer.on("open", (id) => {
  console.log(id);
  // const localId = window.sessionStorage.getItem("id"); 
  // console.log("localId : "+localId);
  // if(localId === null){
  //   window.sessionStorage.setItem("id", id);
  // }else{
  //  id = localId
  // }
  // console.log(id);
  // Store

// Retrieve

  socket.emit("join-room", ROOM_ID, id);
});

// socket.emit("join-room", ROOM_ID, username);

// CHAT
const userCount = [];
const connectToNewUser = (userVId, streams) => {
  var call = peer.call(userVId, streams);
  console.log(call);
  var video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log(userVideoStream);
    addVideoStream(video, userVideoStream);
  //  setRemoteStream(userVideoStream) // remote
  });
  call.on('close', () => {
    video.remove()
  })
  currentPeer = call;
  peers[userVId] = call
  // const html = Object.keys(peers).length + 1;
  //const cc= document.getElementById("countParticipants");
  //alert(Object.keys(peers).length + 1);
  socket.emit("participants",Object.keys(peers).length + 1);
 // cc.value = ""
};

const addVideoStream = (videoEl, stream) => {
  
  videoEl.srcObject = stream;
  videoEl.addEventListener("loadedmetadata", () => {
    videoEl.play();
  });

  videoGrid.append(videoEl);
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
    }
  }
};
const addScreenShareVideoStream = (videoEl, stream) => {
  $("#ssvideo").show();
  $("#video-grid").hide();
  $("#screenShareStop").show();
  $("#screenShare").hide();
  // socket.emit("message", "popup");
  videoEl.srcObject = stream;
  videoEl.addEventListener("loadedmetadata", () => {
    videoEl.play();
  });

  mySSVideo.append(videoEl);
  // let totalUsers = document.getElementsById("ssvideo").length;
  // if (totalUsers > 1) {
  //   for (let index = 0; index < totalUsers; index++) {
  //     document.getElementsById("ssvideo")[index].style.width =
  //       100 / totalUsers + "%";
  //   }
  // }
};
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setPlayVideo = () => {
  const html = `<i class="unmute fa fa-pause-circle"></i>
  <span class="unmute">Resume Video</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setStopVideo = () => {
  const html = `<i class=" fa fa-video-camera"></i>
  <span class="">Pause Video</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fa fa-microphone-slash"></i>
  <span class="unmute">Unmute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};
const setMuteButton = () => {
  const html = `<i class="fa fa-microphone"></i>
  <span>Mute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};
const setScreenShareButton = () => {
  const html = `<span class="material-icons">
  stop_screen_share
  </span>
  <span class="unmute">Stop</span>`;
  document.getElementById("screenShare").innerHTML = html;
};
const setCloseScreenShareButton = () => {
  const html = `<span class="material-icons" style="font-size:32px;">
  present_to_all
  </span>
<span>Screen Share</span>`;
  document.getElementById("screenShare").innerHTML = html;
};
$("#screenShareStop").hide();
function startScreenShare() {

  if (screenSharing) {
    stopScreenSharing()
  }
  navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
    screenStream = stream;
    try{
      let videoTrack = screenStream.getVideoTracks()[0];
      // 
       videoTrack.onended = () => {
         stopScreenSharing()
       }
       if (peer) {
         let sender = currentPeer.peerConnection.getSenders().find(function (s) {
           return s.track.kind == videoTrack.kind;
         })
         sender.replaceTrack(videoTrack)
         //addVideoStream(videoTrack, screenStream);
         screenSharing = true
       }
       console.log(screenStream)
    }catch(error){

    }
   
    addScreenShareVideoStream(mySSVideo, stream);
  })
}


function setLocalStream(stream) {

  let video = document.getElementById("local-video");
  video.srcObject = stream;
  video.muted = true;
  video.play();
}
function setRemoteStream(stream) {

  let video = document.getElementById("ssremvideo");
  video.srcObject = stream;
  video.play();
}
function stopScreenSharing() {
  $("#ssvideo").hide();
  $("#video-grid").show();
  $("#screenShareStop").hide();
  $("#screenShare").show();
  if (!screenSharing) return;
  let videoTrack = myVideoStream.getVideoTracks()[0];
  if (peer) {
    let sender = currentPeer.peerConnection.getSenders().find(function (s) {
      return s.track.kind == videoTrack.kind;
    })
    sender.replaceTrack(videoTrack)
  }
  screenStream.getTracks().forEach(function (track) {
    track.stop();
  });
  screenSharing = false
}


function closeClass(){
  if (confirm("Close Class Room?")) {
    
    setStopVideo();
    setMuteButton();
    stopScreenSharing();
    socket.on('user-disconnected', userVId => {
      if (peers[userVId]) peers[userVId].close()
    })
    location.replace("/thankyou")
  }
}
//chat attachment pop-up  start

function openForm() {
  document.getElementById("myForm").style.display = "block";
}


function closeForm() {
  document.getElementById("myForm").style.display = "none";
} 





// img select start
// const chooseFile = document.getElementById("choose-file");
// const imgPreview = document.getElementById("img-preview");

// chooseFile.addEventListener("change", function () {
//   getImgData();
// });

// function getImgData() {
//   const files = chooseFile.files[0];
//   if (files) {
//     const fileReader = new FileReader();
//     fileReader.readAsDataURL(files);
//     fileReader.addEventListener("load", function () {
//       imgPreview.style.display = "block";
//       imgPreview.innerHTML = '<img src="' + this.result + '" />';
//     });    
//   }
// }

//img select end

//chat attachment pop-up  end




//fullscreen button clicked

var elem = document.getElementById("video-grid");

/* Function to open fullscreen mode */
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

// ===============Upload file using chat
$(document).ready(function() {
  $("#btnSubmit").click(function (event) {

    //stop submit the form, we will post it manually.
    event.preventDefault();

    uploadFile();

  });
});
function uploadFile(){

    // Get form
    var form = $('#fileUploadForm')[0];
    var data = new FormData(form);
    data.append("CustomField", "This is some extra data, testing");
    console.log(data);
    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: "https://backend.softnetworld.in/file/chat/upload",
        //url: "http://localhost:8089/file/chat/upload",
        data: data,
        processData: false, //prevent jQuery from automatically transforming the data into a query string
        contentType: false,
        cache: false,
        timeout: 600000,
        success: function (data) {
        	//alert(JSON.stringify(data));
        	//var obj = JSON.stringify(data);
          //alert(data.filePath);
          var url = new URL(window.location.href);
          var username = url.searchParams.get("authUser");
          var email = url.searchParams.get("email");
          var user_id = url.searchParams.get("user_id");
            console.log(data.filePath)
            var data1 = {};
            data1.msgId = ROOM_ID;
            data1.msg = data.filePath;
            data1.username = username;
            data1.email = email;
            data1.userId = user_id;
            console.log(JSON.stringify(data1))
            $.ajax({
              url: 'https://live.softnetworld.in/message',
             // url: 'http://localhost:3030/message',              
              type: 'POST',
              contentType: 'application/json',
              dataType: "json",
              cache: false,
              data: JSON.stringify(data1),
              success: function (data) {
                //alert('Success!')
              }
              , error: function (jqXHR, textStatus, err) {
                alert('text status ' + textStatus + ', err ' + err)
              }
            })
            socket.emit("message", username + " : <iframe src='" + data.filePath +"'></iframe><br> <a href='" + data.filePath +"' download target=\"_blank\">download</a> ");
            data.filePath = "";
          

        },
        error: function (e) {

        }
    });

}
function PreviewImage() {
  pdffile=document.getElementById("upload_file").files[0];
  pdffile_url=URL.createObjectURL(pdffile);
  $('#viewer').attr('src',pdffile_url);
}
var _validFileExtensionsFile = [".jpg",".docx",".pdf",".doc",".jpeg", ".png"];    
function ValidateSingleInputFile(oInput) {
    if (oInput.type == "file") {
        var sFileName = oInput.value;
         if (sFileName.length > 0) {
            var blnValid = false;
            for (var j = 0; j < _validFileExtensionsFile.length; j++) {
                var sCurExtension = _validFileExtensionsFile[j];
                if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
                    blnValid = true;
                    break;
                }
            }
             
            if (!blnValid) {
                alert("Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFileExtensionsFile.join(", "));
                oInput.value = "";
                return false;
            }
        }
    }
    return true;
}