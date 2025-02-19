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
  
  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({video: true});
      if(videoPermission){
        setVideoAvailable(true);
      }else{
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true});
      if(audioPermission){
        setAudioAvailable(true);
      }else{
        setAudioAvailable(false);
      }
      if(navigator.mediaDevices.getDisplayMedia){
        setScreenAvailable(true);
      }else{
        setScreenAvailable(false);
      }
      if(videoAvailable || audioAvailable){
        const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});
        if(userMediaStream){
          window.localStream = userMediaStream;
          if(localVideoRef.current){
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    getPermissions();
  },[]);
  
  let getUserMediaSuccess = (stream) => {

  }

  let getUserMedia = () => {
    if( (video && videoAvailable) || (audio && audioAvailable)){
      navigator.mediaDevices.getUserMedia({video: video, audio: audio})
      .then(()=>{}) //todo: getMediaSuccess
      .then((stream) => {})
      .catch((err) => console.log(err));
    }else{
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (error) {
        console.log(error);
      }
    }
  }
  useEffect(()=>{
    if( video !== undefined && audio !== undefined){
      getUserMedia();
    }
  },[audio, video]);
  
  let gotMessageFromServer = (formId, message) => {

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
            setVideo((videos) => videos.filter((video) => video.socketId !== id));
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
                     })
                  }
                }
            });
        });
    });
};

  let getMedia = () => {
    setVideo(setVideoAvailable);
    setAudio(setAudioAvailable);

    connectToSocketServer();
  }

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  }
  return (
    <div>
      { askForUsername === true ? (
        <div>
          <h2>Enter to lobby :</h2>
          <input value={username} type='text' onChange={ e => setUsername(e.target.value)}/>
          <button onClick={connect}>Connect</button>

        <div>
          <video ref={localVideoRef} autoPlay muted></video>
        </div>
        </div>
      ) : 
      (
        <>
        </>
      )}
    </div>
  )
}

 
