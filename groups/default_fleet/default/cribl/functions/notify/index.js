exports.name="notify";exports.version="0.0.1";exports.disabled=false;exports.handleSignals=true;exports.group=C.INTERNAL_FUNCTION_GROUP;let group,searchId,savedQueryId,notificationId,message,messageTemplate,authToken,messagesEndpoint,searchUrl,logger,comparatorExpression,trigger="true",triggerCount=0,triggerExpression,resultsLimit=10,triggerCounter=0,triggerType="resultsCount",triggerComparator=">",notificationResults=[],notificationSent=false,signalCounter=0,utLogger=undefined,tenantId=undefined;const{RestVerb}=C.internal.HttpUtils;const{createRequest}=C.internal.kusto;const BulletinMessage=(e,t,r,n,i,s,o)=>({id:`SEARCH_NOTIFICATION_${t}_${e}`,severity:"info",text:r,title:`Scheduled search notification`,time:e,group,metadata:[{itemType:"link",id:n,type:"search",product:"search"},{key:"searchId",value:n},{key:"savedQueryId",value:i},{key:"searchResultsUrl",value:s},{key:"__bulletinIgnore",value:true},{key:"tenantId",value:o}]});const comparators=[">","<","===","!==",">=","<="];exports.init=async e=>{trigger="true";triggerCount=0;triggerExpression;resultsLimit=10;triggerCounter=0;triggerType="resultsCount";triggerComparator=">";notificationResults=[];const t=e.conf;({searchId,message,savedQueryId,authToken,messagesEndpoint,searchUrl,utLogger,notificationId,tenantId}=t);logger=utLogger??C.util.getLogger(`func:notify:${searchId}`);messageTemplate=new C.internal.kusto.Template(message,false,logger);group=t.group??group;trigger=t.trigger??trigger;triggerExpression=new C.expr.Expression(trigger);resultsLimit=t.resultsLimit??resultsLimit;triggerCount=t.triggerCount??triggerCount;triggerType=t.triggerType??triggerType;triggerComparator=t.triggerComparator??triggerComparator;if(!comparators.includes(triggerComparator)){throw new Error(`Unknown comparator ${triggerComparator}`)}comparatorExpression=new C.expr.Expression(`triggerCounter ${triggerComparator} triggerCount`);logger.info("Initialized notify",{...t})};exports.process=async e=>{if(e.__signalEvent__==="final"&&!notificationSent){if(comparatorExpression.evalOn({triggerCounter,triggerCount})){await sendNotification(notificationResults)}}if(e.__signalEvent__==="reset"){signalCounter++;if(signalCounter>1)logger.error("Signal event received in notify pipeline function, which cannot handle previews",{signalCounter})}if(e.__signalEvent__!=null||triggerType==="custom"&&!triggerExpression.evalOn(e))return e;triggerCounter++;if(notificationResults.length<resultsLimit)notificationResults.push(e);return e};async function sendNotification(e){notificationSent=true;const t=new Date;const r=messageTemplate.render({resultSet:e,savedQueryId,searchId,searchResultsUrl:searchUrl,notificationId,timestamp:t.toISOString(),tenantId});const n=BulletinMessage(t.getTime(),notificationId,r,searchId,savedQueryId,searchUrl,tenantId);await sendBulletinMessage(n)}function sanitizeMsg(e){const t=Object.assign({},e);const[r,...n]=t.metadata.reverse();t.metadata=n;return t}async function sendBulletinMessage(e){try{logger.debug("Sending message",{bulletinMessage:sanitizeMsg(e)});const t={url:messagesEndpoint,method:RestVerb.POST,payload:e};const r=await createRequest(t).addAuthToken(authToken).run();await r.readAsJSON()}catch(e){logger.error("Error posting notification message",{error:e})}}exports.unload=()=>{messageTemplate?.dispose();triggerExpression=undefined;notificationResults=undefined};