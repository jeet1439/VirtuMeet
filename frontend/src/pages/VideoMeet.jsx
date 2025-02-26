import React, { useEffect, useRef, useState } from 'react'
import { io } from "socket.io-client";
import { VideoOff, MicOff, Video, Mic, PhoneOff, MessageSquare, Monitor, MonitorOff } from 'lucide-react';

const server_url = 'http://localhost:8080';

const connections = {};

const peerConfigConnections = {
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" }
  ]
}
export default function VideoMeetComponent() {

  let socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);

  let [audioAvailable, setAudioAvailable] = useState(null);

  let [video, setVideo] = useState(false);
  let [audio, setAudio] = useState();

  let [screen, setScreen] = useState();
  let [showModal, setModal] = useState();
  const [showChat, setShowChat] = useState(false);

  let [screenAvailable, setScreenAvailable] = useState();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);

  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");

  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const colors = ["bg-gradient-to-r from-blue-500 to-indigo-500",
    "bg-gradient-to-r from-blue-400 to-cyan-400",
    "bg-gradient-to-r from-blue-600 to-teal-500",
    "bg-gradient-to-r from-sky-500 to-blue-500",
    "bg-gradient-to-r from-indigo-500 to-blue-600",
  ];

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
      // Request media devices
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      window.localStream = userMediaStream;
      localVideoRef.current.srcObject = userMediaStream;


      setVideoAvailable(userMediaStream.getVideoTracks().length > 0);
      setAudioAvailable(userMediaStream.getAudioTracks().length > 0);
    } catch (error) {
      console.error("Error getting media:", error);
      window.localStream = new MediaStream([
        black(),
        silance(),
      ]);
      localVideoRef.current.srcObject = window.localStream;
    }
  };


  useEffect(() => {
    getPermissions();
  }, []);

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop())
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream)

      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
          })
          .catch(e => console.log(e))
      })
    }
    stream.getTracks().forEach(track => track.onended = () => {
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


      for (let id in connections) {
        connections[id].addStream(window.localStream)
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
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
    let canvas = Object.assign(document.createElement("canvas"), { width, height });

    canvas.getContext('2d').fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => { })
        .catch((e) => console.log(e))
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message)
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }))
              }).catch(e => console.log(e))
            }).catch(e => console.log(e))
          }
        }).catch(e => console.log(e))
      }
      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
      }
    }
  }


  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);

      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", (data, sender, socketIdSender) => {
        addMessage(data, sender, socketIdSender);
      });

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));

      });

      socketRef.current.on("user-joined", (id, clients) => {

        setMessages([]); 
        clients.forEach((socketListId) => {

          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }))
            }
          }
          connections[socketListId].onaddstream = (event) => {
            let videoExits = videoRef.current.find(video => video.socketId === socketListId);
            if (videoExits) {
              setVideos(videos => {
                const updatedVideos = videos.map(video =>
                  video.socketId === socketListId ? { ...video, stream: event.stream } : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              })
            } else {
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
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            //blacksilance

            let blacksilance = (...args) => new MediaStream([black(...args), silance()])
            window.localStream = blacksilance();
            connections[socketListId].addStream(window.localStream);
          }
        });
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue
            try {
              connections[id2].addStream(window.localStream)
            } catch (err) {
              console.log(err)
            }
            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }))
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

  const toggleVideo = () => {
    if (!window.localStream) {
      console.error("Local stream not initialized!");
      return;
    }

    const newVideoState = !video;
    setVideo(newVideoState);
    setIsVideoPlaying(newVideoState);

    // Toggle video tracks
    window.localStream.getVideoTracks().forEach(track => {
      track.enabled = newVideoState;
    });

    // Update peer connections
    Object.values(connections).forEach(connection => {
      if (connection && connection.getSenders) {
        const sender = connection.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.track.enabled = newVideoState;
      }
    });
  };

  const toggleMute = () => {
    setIsMuted((prevMuted) => {
      const newMutedState = !prevMuted;

      if (window.localStream) {
        window.localStream.getAudioTracks().forEach((track) => {
          track.enabled = !newMutedState;
        });
      }
      if (connections) {
        for (let id in connections) {
          const connection = connections[id];
          if (connection && connection.getSenders) {
            const sender = connection.getSenders().find(s => s.track && s.track.kind === 'audio');
            if (sender) {
              sender.track.enabled = !newMutedState;
            }
          }
        }
      }

      return newMutedState;
    });
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.log(error);
    }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream)
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
          })
          .catch(e => console.log(e))
      })
    }


    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false)
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

      getUserMedia();


    })
  }
  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => { })
          .catch((e) => console.log(e))
      }
    }
  }

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  const handleScreen = () => setScreen(!screen);

  const toggleChat = () => setShowChat((prev) => !prev);


  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data }
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  const handleMessage = (e) => {
    setMessage(e.target.value);
  };

  const sendMessage = () => {
    if (message.trim() === "") return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };


  const handleEndCall = () => {
    // Emit a custom event "end-call" to the server to signal the disconnection
    socketRef.current.emit("end-call");
    setMessages([]);
    // Close the peer connections
    for (let socketId in connections) {
      if (connections.hasOwnProperty(socketId)) {
        connections[socketId].close();
        delete connections[socketId];
      }
    }
  
    // Close the local media stream if available
    if (window.localStream) {
      const tracks = window.localStream.getTracks();
      tracks.forEach(track => track.stop());
      window.localStream = null;
    }
  
    // Update the UI to reflect that the call is ended
    setVideos([]);

    useEffect(() => {
      socketRef.current.on("clear-messages", () => {
        setMessages([]);  // Clear the messages when the server broadcasts this event
      });
    
      return () => {
        socketRef.current.off("clear-messages");  // Cleanup the event listener
      };
    }, []);

  };
 

  return (
    <div>
      {askForUsername === true ? (
        <div className="relative w-full h-screen overflow-hidden bg-slate-900">

          <video
            ref={localVideoRef}
            autoPlay
            muted={isMuted}
            className="absolute top-0 left-0 w-full h-[100vh] object-contain transform scale-x-[-1]"
          ></video>

          <div className=' fixed bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col' >
            <div className="flex  space-x-4 mb-6 flex-row align-middle text-center justify-center">
            </div>
            <div className="flex  space-x-4 mb-6 flex-row">
              <input
                value={username}
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                className='h-10 rounded-md'
                placeholder="Enter your name"
              />

              <button onClick={connect} className='bg-green-500 h-10 px-2 py-2 rounded-md hover:bg-green-600'>
                Connect
              </button>
            </div>
          </div>
        </div>
      ) :
        (
          <>

            <div className="relative w-full h-screen bg-gray-900 flex flex-wrap gap-4 p-4 overflow-hidden">
              {/* Remote Videos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full h-full p-4">
                {videos.map((video) => (
                  <div key={video.socketId} className="">

                    <video
                      data-socket={video.socketId}
                      ref={(ref) => {
                        if (ref && video.stream) {
                          ref.srcObject = video.stream;
                        }
                      }}
                      autoPlay
                      className="w-full h-auto rounded-md transform bg-black"
                    ></video>
                    <p className="text-white text-sm mb-1 text-center">User: {video.socketId}</p>
                  </div>
                ))}
              </div>
              {/* local video */}
              <div className="absolute bottom-4 right-4 w-40 h-40 md:w-56 md:h-56 bg-black rounded-lg overflow-hidden shadow-xl border-2 border-gray-700 flex items-center justify-center">
                {isVideoPlaying ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    className={`w-full h-full object-cover ${screen ? "" : "transform scale-x-[-1]"
                      }`}
                  ></video>
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <VideoOff className="text-gray-500 w-10 h-10" />
                    {isMuted && (
                      <MicOff className="text-gray-500 w-10 h-10" />
                    )}
                  </div>
                )}
              </div>

            </div>



            <div className=' fixed bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col' >
              <div className="flex  space-x-4 mb-6 flex-row align-middle text-center justify-center">
                <button
                  onClick={toggleVideo}
                  className=" text-white rounded-lg shadow-lg transition duration-300"
                >
                  {isVideoPlaying ? <Video /> : <VideoOff />}
                </button>
                <button
                  onClick={toggleMute}
                  className=" text-white rounded-lg shadow-lg transition duration-300"
                >
                  {isMuted ? <MicOff /> : <Mic />}
                </button>
                <button className='text-red-600' onClick={handleEndCall}>
                  <PhoneOff />
                </button>
                <button className='text-stone-100' onClick={toggleChat} >
                  <MessageSquare />
                </button>

                <button className='text-stone-100' onClick={handleScreen}>
                  {screen ? (<Monitor />) : (<MonitorOff />)}
                </button>
              </div>
            </div>
            <div
              className={`fixed top-0 right-0 w-80 h-full bg-gray-800 shadow-lg transform ${showChat ? "translate-x-0" : "translate-x-full"
                } transition-transform duration-300`}
            >
              <div className={`fixed top-0 right-0 w-80 h-full bg-gray-800 shadow-lg transform ${showChat ? "translate-x-0" : "translate-x-full"
                } transition-transform duration-300`}>
                <div className="p-4 text-white flex justify-between items-center border-b border-gray-700">
                  <h2 className="text-lg">Chat Room</h2>
                  <button onClick={toggleChat} className="text-red-400">Close</button>
                </div>

                <div className="flex flex-col h-[85vh] first-letter:p-4 space-y-2">
                  <div className="flex-1 overflow-y-auto">

                    {messages.map((msg, index) => {
                      const bgColor = colors[index % colors.length];

                      return (
                        <div
                          key={index}
                          className={`p-2 my-1 rounded-md ${msg.sender === username ? `${bgColor} text-white ml-auto` : "bg-gray-700 text-white mr-auto"} max-w-[80%]`}
                        >
                          <p className="text-sm underline">{msg.sender}</p>
                          <p className="text-md">{msg.data}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 mx-2">
                    <input
                      type="text"
                      className="flex-1 p-2 rounded-l-md bg-gray-700 text-white"
                      placeholder="Type a message..."
                      value={message}
                      onChange={handleMessage}
                    />
                    <button onClick={sendMessage} className="bg-blue-500 px-4 rounded-r-md">Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
    </div>
  )
}

