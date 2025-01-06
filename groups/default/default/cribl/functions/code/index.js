exports.name="Code";exports.version="0.2";exports.disabled=false;exports.group="Advanced";const{Expression}=C.expr;let cLogger;let code;let logger;let numLogs=0;let activeLogSampleRate;exports.init=e=>{const{conf:t,pid:o,pipeIdx:r}=e;const{useUniqueLogChannel:a}=t;if(a){const e=`func:code:${o}:${r}`;cLogger=C.util.getLogger(e)}else{cLogger=C.util.getLogger("func:code")}t.code=t.code?t.code.trim():"";if(!t.code)throw new Error(`Code can't be left empty!`);if(t.maxNumOfIterations||t.maxNumOfIterations===0){t.maxNumOfIterations=Number(t.maxNumOfIterations);t.maxNumOfIterations=Number.isNaN(t.maxNumOfIterations)?-1:t.maxNumOfIterations;if(t.maxNumOfIterations<1||t.maxNumOfIterations>1e4)throw new Error(`The maximum number of iterations must be set between 1 and 10,000!`)}numLogs=0;activeLogSampleRate=Number(t.activeLogSampleRate??1);if(Number.isNaN(activeLogSampleRate)||activeLogSampleRate<1||activeLogSampleRate>5e3){throw new Error("The active log sample rate must be set between 1 and 5,000!")}code=new Expression(`${t.code}`,{unprotected:true,maxNumOfAllowedIterations:t.maxNumOfIterations});logger=getLogger();return[{func:exports.name,severity:"warn",message:`Has been enabled.`}]};exports.process=e=>{if(!e||!code)return e;try{code.unsafeEvalOn(e,logger)}catch(e){if(numLogs++%activeLogSampleRate===0){cLogger.error("Error while executing Code function.",{err:e})}}return e};function getLogger(){if(Boolean(process.env.CRIBL_PREVIEW))return(e,t={})=>cLogger.info(e,t);else return(e,t={})=>cLogger.debug(e,t)}if(process.env.NODE_ENV==="test"){exports.getExpression=()=>code}