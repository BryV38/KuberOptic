/**
 * ************************************
 *
 * @module  UploadPage.tsx
 * @author
 * @date
 * @description upload page for clusters from Google Cloud Platform
 *
 * ************************************
 */

import * as React from 'react';
import { useContext } from 'react';
import DisplayContainer from './DisplayContainer';
import { StoreContext } from '../../../store';
const { ipcRenderer } = require('electron');
var async = require("async");
require('events').EventEmitter.defaultMaxListeners = 25;

const UploadPage = () => {
  const [Store, setStore] = useContext(StoreContext);

  ipcRenderer.on('clusterClient', (event: any, arg: any) => {
    //logic incase we have more than one cluster already rendered
    // Bryan commented out the following for his own logic rendering
    // if(Store.clusterCount < arg.length){
    //   let newClusters = [];
    //   arg.forEach(el=> newClusters.push(el))
    //   setStore({...Store, clusters: newClusters, clusterCount: newClusters.length })
    // }
    // else setStore({...Store, clusters: arg, clusterCount: arg.length });

    let multi = Store.multiZoneClusters;
    console.log('******* Initial multi')
    console.log(multi)
    console.log(arg)

    if (multi === null) multi = [];

    console.log('*******  multi array')
    console.log(multi)

    arg.forEach((addClus) => {
      console.log('cluster in for each')
      console.log(addClus)
      multi.push(addClus);
      console.log(`pushed into multi: `)
      console.log(multi)
     
    })

    console.log('after for loop')
    console.log(multi)

    multi = Object.values(multi.reduce((acc, cur) => Object.assign(acc, { [cur.clusterName]: cur }), {}))

    console.log('after for filter')
    console.log(multi)

    setStore({ ...Store, multiZoneClusters: multi, clusters: multi, clusterCount: multi.length})

    console.log(`Bryan: After Res.clusters from GCP => Invoked clusterClient at UploadPage: Clusters: ${Store.clusters}`)
    
    event.returnValue = 'done';
  })

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    setStore({...Store, credentials:e.currentTarget.value});
  };
    
  const handleBack = () => {
    setStore({...Store, landingPageState:false});
  };
  
  const handleLoc = (event) => {
    // setStore({...Store, gcploc: event.currentTarget.value});
    setStore({ ...Store, multiZones: ['us-central1-a', 'us-central1-b', 'us-central1-c']});
    console.log(`Bryan: handleLoc multiZones: ${Store.multiZones}`)
  }
  
  const handleSubmit = () => {
    const creds = JSON.parse(Store.credentials); 
    if(typeof creds !== 'object'){
      console.log('Enter a JSON object from GCP');
      console.log('locStore: ', Store.gcploc)
    }
    else{
      // ipcRenderer.send('asynchronous-message', creds, Store.gcploc)
      // setStore({...Store, uploadPageState: true });
      console.log(`Bryan default multi zones at Submit: ${Store.multiZones}`)
      
      async function submit() {
        console.log(`Bryan: submit invoked at UploadPage`)

        for (let zone of Store.multiZones) {
          console.log(`Bryan await loop => zone: ${zone}`)
          const a = await ipcRenderer.send('asynchronous-message', creds, zone)
          console.log(a);
          console.log(Store.clusters)
          console.log(`Await function for zone ***${zone}*** done`)
        }
        console.log(`************ Await function done`)
      }
      submit().then(function() {
        setStore({ ...Store, uploadPageState: true });
        console.log(`Bryan submit done at UploadPage`);
      }
      )

      // Store.multiZones.forEach((zone) => {
      //   console.log(`Bryan foreach func - zone: ${zone}`)
      //   ipcRenderer.send('asynchronous-message', creds, zone)
      // })
    }
  }
    
  return (
    <>
      { Store.uploadPageState ? 
      <DisplayContainer /> :
      <div className='uploadDiv'>
          <div className="gcpImageContainer">
            <img className='kubUpload' src={require('../assets/credsPage/google.png')}/>
            <div className='kubUploadText'>Google Cloud Platform</div>
          </div>

        <div id="uploadDivForSubmitandBackButts">
          <input id="uploadEnterClustInfo" className='uploadInput' type="text" onChange={handleInput} placeholder="Enter Project Info"/>
          <div className="buttonHolder">
            <button id="uploadSubmit" className='uploadButt' onClick={handleSubmit}> Submit </button>
            <button id="uploadBackButt" className = 'backButton' onClick={handleBack}>  Back  </button>
          </div>
        </div>
        <div className="locationDropDown">
          <select id="uploadSelectMenu" className='loc' onChange={handleLoc}>
          <option>Select Zone</option>
          <option value='us-central1-a'>us-central1-a</option>
          <option value='us-central1-b'>us-central1-b</option>
          <option value='us-central1-c'>us-central1-c</option>
          <option value='southamerica-east1-a'>southamerica-east1-a</option>
          <option value='southamerica-east1-b'>southamerica-east1-b</option>
          <option value='southamerica-east1-c'>southamerica-east1-c</option>
          <option value='europe-west2-a'>europe-west2-a</option>
          <option value='us-west1-a'>us-west1-a</option>
          </select>
        </div>
      </div>
      }
    </>
  )
}

export default UploadPage;
