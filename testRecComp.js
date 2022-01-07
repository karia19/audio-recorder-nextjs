
import styles from '../styles/Home.module.css'
import React from 'react';
import Head from 'next/head';
import ErrAudio from '../components/errorAudio';
import Draggable from 'react-draggable';



const TestRec =  () => {
    let source
    let recorder;
    let audio;    
    let recBlob;

    const [recordBlob, setRecordBlob ] = React.useState('')
    const [ audioUrl, setAudioUrl ] = React.useState('')
    const [recrdOn, setRecrdOn ] = React.useState(false)
    const [ errInAudio, setErrInAudio ] = React.useState('');

 
    const recordAudio = async () =>
        
        new Promise(async resolve => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream1){
                const aud = document.querySelector('audio')
                console.log(aud)
                console.log("stre1", stream1.getAudioTracks()[0])
                aud.srcObject = stream1

                var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                var analyser = audioCtx.createAnalyser();

                source = audioCtx.createMediaStreamSource(stream1);
                source.connect(analyser);
                //analyser.connect(distortion);
                //distortion.connect(audioCtx.destination);

                analyser.fftSize = 2048;
                var bufferLength = analyser.frequencyBinCount;
                var dataArray = new Uint8Array(bufferLength);

                analyser.getByteTimeDomainData(dataArray);

                
                

                let canvas = document.getElementById("canvas");
                let canvasCtx = canvas.getContext("2d");
                
                const WIDTH = canvas.width;
                const HEIGHT = canvas.height;

                /*
                canvasCtx.fillStyle = '#F0DB4F';
                canvasCtx.strokeStyle = 'red';
                 // draw a rectangle with fill and stroke
                canvasCtx.fillRect(50, 50, 150, 100);
                canvasCtx.strokeRect(50, 50, 150, 100);
                */
                //canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
                
                function draw() {
                    var drawVisual = requestAnimationFrame(draw);
                    analyser.getByteTimeDomainData(dataArray);
                    canvasCtx.fillStyle = '#0f0f0f';
                    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                    canvasCtx.lineWidth = 2;
                    canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
                    canvasCtx.beginPath();

                    var sliceWidth = WIDTH * 1 / bufferLength;
                    var x = 0;
                    
                    for(var i = 0; i < bufferLength; i++) {

                        var v = dataArray[i] / 128.0;
                        var y = v * HEIGHT/2;
                
                        if(i === 0) {
                          canvasCtx.moveTo(x, y);
                        } else {
                          canvasCtx.lineTo(x, y);
                        }
                
                        x += sliceWidth;
                      }
                    canvasCtx.lineTo(canvas.width, canvas.height/2);
                    canvasCtx.stroke();

                    
                }
                draw()
                
                aud.onloadedmetadata = function(e) {
                // Play audio to speakers //
                   //aud.play()   
                  };
        })
       
        let stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        
        const mediaRecorder = new MediaRecorder(stream);
        let audioChunks = [];
        
        mediaRecorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
            
        });
        
        const start = () => {
          audioChunks = [];        
          mediaRecorder.start();

          
        };
        const stop = () =>
         
        
          new Promise(resolve => {
            mediaRecorder.addEventListener('stop', () => {
              const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
              const audioUrl = URL.createObjectURL(audioBlob);
              
              try {
                setRecordBlob(audioBlob)
                setAudioUrl(audioUrl)
              } catch(e) {
                  console.log(e)
              }
              const play = () => audio.play();
              resolve({ audioChunks, audioBlob, audioUrl, play });
            });

            mediaRecorder.stop();
          });

        resolve({ start, stop });
    });
    const startRec =  async () => {
        setRecrdOn(false)
        
        setAudioUrl('')
        setRecordBlob('')
        //setMicOn(true)
        try {
        if (!recorder) {
            recorder = await recordAudio();
            
            console.log("is recorder", recorder)
          }
          recorder.start();
        } catch(e) {
            setErrInAudio("Try another browser (Google Chrome, Safari)")
            setTimeout(() => {
                setErrInAudio('')
            }, 3000)
        }
    }
    
    const stopRec = async () => {
        try {
            audio = await recorder.stop()
            console.log("stop re", recorder)
            setRecrdOn(true)
        } catch(e) {
            setErrInAudio("Some errors, please reload page ;)")
            setTimeout(() => {
                setErrInAudio('')
            }, 3000)
        }
        
    }
    const playAudio = () => {
        audio.play()
    }
    const sendData = async () => {
        //console.log(recordUrl)
        if (recordBlob.length == 0){
            setErrInAudio("No audio file to send, record again")
            setTimeout(() => {
                setErrInAudio('')
            },4000)
        } else {
        
            const fileaName = getFileName('wav')
            let file = new File([recBlob], fileaName, {
                type: 'audio/wav'
            });
            let formData = new FormData();
            formData.append('file', file)

            console.log(formData, fileaName, recordBlob)
        }
    }
    const clearData = () => {
        setRecrdOn(false)
        setAudioUrl('')
        setRecordBlob('')
    }
   
    return(
        <div>
        <Head>
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.12.1/css/all.css" crossOrigin="anonymous" />

        </Head>
        <div  className={styles.main}>
                <ErrAudio 
                 data={errInAudio}
                />
                <p>Äänitä ja lähetä, voit poistaa raidan roskakori napista</p>
               <audio id="noise"></audio>
               <Draggable>
               <div className={styles.mainCard}>
                <div className={styles.mainCardLeft}>
                  <button className='btn btn-outline-primary mr-1'  onClick={() => sendData()}><i style={{ fontSize: "15px"}} className="fa fa-share" aria-hidden="true"></i>
                  </button>
                  <button className='btn btn-outline-secondary' onClick={() => clearData()}><i style={{ fontSize: "15px"}} className="fa fa-trash" aria-hidden="true"></i></button>
         
               </div>
                <div>
             </div>
             <div style={{ padding: "10px"}}>
             <div className={styles.canvasRound}>
             <canvas className={styles.canvasRecorder} id="canvas"></canvas>     
             </div>
             <div style={{ display: "", justifyContent: "center"}}>
                 <button className='shadow  btn btn-danger mr-1' onClick={() => startRec()}> <i style={{ fontSize: "18px", color: "white"}} onClick={() => startRec()} className={"fa fa-microphone"} aria-hidden="true"></i>                </button>
                 <button className='shadow btn btn-primary' id="stop" onClick={() => stopRec()}><i style={{ fontSize: "18px", color: "white"}} className="fa fa-stop" aria-hidden="true"></i></button>
             </div>
           
            </div>
         </div>
         </Draggable>
         {recrdOn ?
            <div style={{ marginTop: "10px"}}>
            <audio id="own-aud" controls="controls">
                <source src={audioUrl} type="audio/wav" /> 
            </audio>
            </div>
         :
            <div style={{ marginTop: "35px"}}>
            
            </div>
         }
         </div>
        
        </div>
    )
}

function getFileName(fileExtension) {
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var date = d.getDate();
    var millSecond = d.getMilliseconds()
    return  year + month + date + millSecond + '.' + fileExtension;
}

export default TestRec;