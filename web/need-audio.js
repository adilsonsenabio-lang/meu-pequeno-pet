import {emptyVoiceSchedule,nextNeedVoice} from './need-voice.js';

// Cada arquivo é gravado uma vez e incluído no pacote offline antes da ativação.
export const NEED_LINES={
  food:['Estou com fome.','Quero comer.'],
  water:['Estou com sede.','Quero água.'],
  clean:['Estou sujinho.','Quero um banho.'],
  potty:['Preciso ir ao banheiro.','Vamos ao banheiro?'],
  energy:['Estou com sono.','Quero dormir.'],
  affection:['Quero um carinho.','Me dá um abraço?'],
  fun:['Quero brincar.','Vamos jogar?']
};
export const NEED_AUDIO={
  food:['./assets/voice-food-1.mp3','./assets/voice-food-2.mp3'],
  water:['./assets/voice-water-1.mp3','./assets/voice-water-2.mp3'],
  clean:['./assets/voice-bath-1.mp3','./assets/voice-bath-2.mp3'],
  potty:['./assets/voice-potty-1.mp3','./assets/voice-potty-2.mp3'],
  energy:['./assets/voice-sleep-1.mp3','./assets/voice-sleep-2.mp3'],
  affection:['./assets/voice-love-1.mp3','./assets/voice-love-2.mp3'],
  fun:['./assets/voice-play-1.mp3','./assets/voice-play-2.mp3']
};
export const NEED_AUDIO_FILES=Object.values(NEED_AUDIO).flat();

export class NeedAudioPlayer{
  constructor(makeAudio=source=>new Audio(source)){
    this.makeAudio=makeAudio;
    this.schedule=emptyVoiceSchedule();
    this.current=null;
    this.cache=new Map();
  }
  stop(){
    this.schedule=emptyVoiceSchedule();
    if(this.current){this.current.pause();this.current.currentTime=0;this.current=null;}
  }
  tick(needs,now,{enabled=true,visible=true,ready=true}={}){
    if(!enabled||!visible||!ready){this.stop();return null;}
    const next=nextNeedVoice(this.schedule,needs,now);
    this.schedule=next.schedule;
    if(!next.schedule.need){this.stop();return null;}
    if(!next.event)return null;
    const {need,take}=next.event,source=NEED_AUDIO[need]?.[take-1];
    if(!source)return null;
    this.current?.pause();
    const audio=this.cache.get(source)||this.makeAudio(source);
    this.cache.set(source,audio);
    audio.currentTime=0;
    audio.volume=.55;
    this.current=audio;
    Promise.resolve(audio.play()).catch(()=>{});
    return next.event;
  }
}
