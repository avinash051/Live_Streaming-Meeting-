const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
var local_stream;

myVideo.muted = true;
var currentPeer = null
var screenStream;
var screenSharing = false
var peer = new Peer({
  host: "0.peerjs.com",
  port: 443,
  path: "/",
  pingInterval: 5000,
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

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
      
    });

    document.addEventListener("keydown", (e) => {
      var url = new URL(window.location.href);
      var username = url.searchParams.get("authUser");
      var email = url.searchParams.get("email");
      var user_id = url.searchParams.get("user_id");
      if (e.which === 13 && chatInputBox.value != "") {
        console.log(username)
        var data = {};
        data.msg_id = ROOM_ID;
        data.msg = chatInputBox.value;
        data.username = username;
        data.email = email;
        data.user_id = user_id;
        console.log(JSON.stringify(data))
        $.ajax({
          url: 'https://live.softnetworld.in/message',
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
      let li = document.createElement("li");
      li.innerHTML = msg;
      all_messages.append(li);
      main__chat__window.scrollTop = main__chat__window.scrollHeight;
    });
  });

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
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

  socket.emit("join-room", ROOM_ID, id);
});

// socket.emit("join-room", ROOM_ID, username);

// CHAT

const connectToNewUser = (userId, streams) => {
  var call = peer.call(userId, streams);
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
  peers[userId] = call
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

function startScreenShare() {
  if (screenSharing) {
    stopScreenSharing()
  }
  navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
    screenStream = stream;
    let videoTrack = screenStream.getVideoTracks()[0];
    videoTrack.onended = () => {
      stopScreenSharing()
    }
    if (peer) {
      let sender = currentPeer.peerConnection.getSenders().find(function (s) {
        return s.track.kind == videoTrack.kind;
      })
      sender.replaceTrack(videoTrack)
      screenSharing = true
    }
    console.log(screenStream)
  })
}
function setLocalStream(stream) {

  let video = document.getElementById("local-video");
  video.srcObject = stream;
  video.muted = true;
  video.play();
}
function setRemoteStream(stream) {

  let video = document.getElementById("remote-video");
  video.srcObject = stream;
  video.play();
}
function stopScreenSharing() {
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
function close(){
  window.close()
}
//chat attachment pop-up  start

function openForm() {
  document.getElementById("myForm").style.display = "block";
}


function closeForm() {
  document.getElementById("myForm").style.display = "none";
} 





// img select start
const chooseFile = document.getElementById("choose-file");
const imgPreview = document.getElementById("img-preview");

chooseFile.addEventListener("change", function () {
  getImgData();
});

function getImgData() {
  const files = chooseFile.files[0];
  if (files) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(files);
    fileReader.addEventListener("load", function () {
      imgPreview.style.display = "block";
      imgPreview.innerHTML = '<img src="' + this.result + '" />';
    });    
  }
}

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

