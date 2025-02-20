import React, { useEffect, useRef, useState } from 'react'
import { io } from "socket.io-client";
``

const server_url = 'http://localhost:8080';

const connections = { };

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}
export default function VideoMeetComponent() {

  let socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable ] = useState(true);

  let [audioAvailable, setAudioAvailable ] = useState(null);

  let [ video, setVideo ] = useState([]);
  let [ audio, setAudio ] = useState();

  let [ screen, setScreen ] =useState();
  let [ showModal, setModal ] = useState();
  
  let [ screenAvailable, setScreenAvailable ] = useState();
  let [ messages, setMessages ] = useState([]);

  let [ message, setMessage ] = useState("");
  let [ newMessages, setNewMessages ] = useState(0);

  let [ askForUsername, setAskForUsername ] = useState(true);
  let [username, setUsername ] = useState("");

  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

  // if(isChrome() === false){

  // }
  
  // const getPermissions = async () => {
  //   try {
  //     const videoPermission = await navigator.mediaDevices.getUserMedia({video: true});
  //     if(videoPermission){
  //       setVideoAvailable(true);
  //     }else{
  //       setVideoAvailable(false);
  //     }

  //     const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true});
  //     if(audioPermission){
  //       setAudioAvailable(true);
  //     }else{
  //       setAudioAvailable(false);
  //     }
  //     if(navigator.mediaDevices.getDisplayMedia){
  //       setScreenAvailable(true);
  //     }else{
  //       setScreenAvailable(false);
  //     }
  //     if(videoAvailable || audioAvailable){
  //       const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});
  //       if(userMediaStream){
  //         window.localStream = userMediaStream;
  //         if(localVideoRef.current){
  //           localVideoRef.current.srcObject = userMediaStream;
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  const getPermissions = async () => {
    try {
        const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoAvailable(true); // Always true if successful

        const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioAvailable(true);

        if (navigator.mediaDevices.getDisplayMedia) {
            setScreenAvailable(true);
        } else {
            setScreenAvailable(false);
        }

        const userMediaStream = await navigator.mediaDevices.getUserMedia({
            video: true, audio: true 
        });

        if (userMediaStream) {
            window.localStream = userMediaStream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = userMediaStream;
            }
        }
    } catch (error) {
        console.log("Error in getPermissions:", error);
    }
};
  useEffect(() => {
    getPermissions();
  },[]);
  
  let getUserMediaSuccess = (stream) => {
      try {
        window.localStream.getTracks().forEach(track => track.stop())
      } catch (e) {
        console.log(e);
      }
      window.localStream = stream;
      localVideoRef.current.srcObject = stream;

      for(let id in connections){
        if(id === socketIdRef.current) continue;
        connections[id].addStream(window.localStream)

        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
          .then(()=>{
            socketIdRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
          })
          .catch(e => console.log(e))
        })
      }
      stream.getTracks.forEach(track => track.onended = () => {
        setVideo(false);
        setAudio(false);
        try {
          let tracks = localVideoRef.current.srcObject.getTracks()
          tracks.forEach(track => track.stop())
        } catch (e) {
          console.log(e)
        }
        //TODO BlackSilance
        let blacksilance = (...args) => new MediaStream([black(...args), silance()])
          window.localStream = blacksilance();
          localVideoRef.current.srcObject = window.localStream;


        for(let id in connections){
          connections[id].addStream(window.localStream)
          connections[id].createOffer().then((description) => {
            connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
            }).catch(e => console.log(e));
          })
        }
      })
  }

  let silance = () => {
    let ctx = new AudioContext();
    let oscilator = ctx.createOscillator();

    let dst = oscilator.connect(ctx.createMediaStreamDestination());

    oscilator.start();
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
  }

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {width, height});

    canvas.getContext('2d').fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  // let getUserMedia = () => {
  //   if( (video && videoAvailable) || (audio && audioAvailable)){
  //     navigator.mediaDevices.getUserMedia({video: video, audio: audio})
  //     .then(()=>{}) //todo: getMediaSuccess
  //     .then((stream) => {})
  //     .catch((err) => console.log(err));
  //   }else{
  //     try {
  //       let tracks = localVideoRef.current.srcObject.getTracks();
  //       tracks.forEach(track => track.stop());
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // }
  const getUserMedia = async () => {
    try {
        if (videoAvailable || audioAvailable) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            window.localStream = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        }
    } catch (error) {
        console.log("Error getting user media:", error);
    }
};

  useEffect(()=>{
    if( video !== undefined && audio !== undefined){
      getUserMedia();
    }
  },[audio, video]);
  
  let gotMessageFromServer = (fromId, message) => {
      var signal = JSON.parse(message)
      if(fromId !== socketIdRef.current){
        if(signal.sdp){
          connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
            if(signal.sdp.type === "offer"){
              connections[fromId].createAnswer().then((description) => {
                connections[fromId].setLocalDescription(description).then(() => {
                  socketRef.current.emit("signal", fromId , JSON.stringify({"sdp": connections[fromId].localDescription}))
                }).catch(e => console.log(e)) 
              }).catch(e => console.log(e))
            }
          }).catch(e => console.log(e))
        }
        if(signal.ice){
          connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
        }
      }
  }
  
  let addMessage = () => {

  }
  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false }); 
  
    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on("connect", () => {
        socketRef.current.emit("join-call", window.location.href);

        socketIdRef.current = socketRef.current.id; 

        socketRef.current.on("chat-message", addMessage);

        socketRef.current.on("user-left", (id) => {
            setVideos((videos) => videos.filter((video) => video.socketId !== id));

        });

        socketRef.current.on("user-joined", (id, clients) => {
            clients.forEach((socketListId) => {

                connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                connections[socketListId].onicecandidate = (event) => {
                  if(event.candidate != null){
                    socketRef.current.emit("signal", socketListId, JSON.stringify({'ice': event.candidate}))
                  }
                }
                connections[socketListId].onaddstream = (event) => {
                  let videoExits = videoRef.current.find(video => video.socketId === socketListId);
                  if(videoExits){
                    setVideo(videos => {
                      const updatedVideos = videos.map(video => 
                              video.socketId === socketListId ? { ...video, stream: event.stream } : video
                      );
                      videoRef.current = updatedVideos;
                      return updatedVideos;
                    })
                  }else{
                     let newVideo = {
                      socketId: socketListId,
                      stream: event.stream,
                      autoPlay: true,
                      playsinline: true
                     }
                     setVideos(videos => {
                      const updatedVideos = [...videos, newVideo];
                      videoRef.current = updatedVideos;
                      return updatedVideos;
                     });
                  }
                };
              if(window.localStream !== undefined && window.localStream !== null){
                connections[socketListId].addStream(window.localStream);
              }else{
               //blacksilance

               let blacksilance = (...args) => new MediaStream([black(...args), silance()])
               window.localStream = blacksilance();
               connections[socketListId].addStream(window.localStream);
              }
            });
            if(id === socketIdRef.current){
              for(let id2 in connections){
                if(id2 === socketIdRef.current) continue
                try {
                  connections[id2].addStream(window.localStream)
                } catch (err) {
                  console.log(err)
                }
                connections[id2].createOffer().then((description) => {
                  connections[id2].setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit("signal", id2, JSON.stringify({"sdp": connections[id2].localDescription}))
                  })
                  .catch(e => console.log(e));
                })
              }
            }
        });
    });
};

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);

    connectToSocketServer();
  }

  const connect = async () => {
    await getPermissions(); 
    setAskForUsername(false);
    getMedia(); 
};

  return (
    <div>
      { askForUsername === true ? (
        <div>
          <h2>Enter to lobby :</h2>
          <input value={username} type='text' onChange={ e => setUsername(e.target.value)}/>
          <button onClick={connect}>Connect</button>

        <div>
          <video ref={localVideoRef} autoPlay muted>

          </video>
        </div>
        </div>
      ) : 
      (
        <>
        <video ref={localVideoRef} autoPlay muted>

        </video>
        {videos.map((video) => (
        <div key={video.socketId}>
             {video.socketId}
             <video data-socket={video.socketId} ref={ref => {
              if(ref && video.stream){
                ref.srcObject = video.stream;
              }
             }} autoPlay></video>
        </div>
        ))}
        </>
      )}
    </div>
  )
}

 
