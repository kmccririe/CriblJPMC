exports.name="Splunk Search";exports.version="0.1";exports.disabled=false;exports.destroyable=false;const{DEFAULT_TIMEOUT_SECS}=C.internal.HttpUtils;const{RestCollector}=C.internal.Collectors;const restC=new RestCollector;function normalizeSearchQuery(e){if(!e)throw new Error("Missing required parameter search");e=e.trim();if(e.startsWith("search ")||e.startsWith("|")){return e}else{return`search ${e}`}}function getCollectMethod(e){if(e?.includes("v2")&&e?.includes("export")){return"post"}else{return"get"}}function getCollectorConfig(e){const t=e.conf;let s=C.expr.runExprSafe(t.searchHead);if(s.endsWith("/"))s.substr(0,s.length-1);let r=C.expr.runExprSafe(t.endpoint);if(!r.startsWith("/"))r=`/${r}`;const o=`${s}${r}`;const a={discovery:{discoverType:"none"},collectMethod:getCollectMethod(r),authentication:t.authentication,collectUrl:o,collectRequestParams:[{name:"search",value:normalizeSearchQuery(C.expr.runExprSafe(t.search))}],collectRequestHeaders:[{name:"accept",value:"'application/json'"}],username:t.username,password:t.password,filter:"(true)",discoverToRoutes:false,timeout:!isNaN(t.timeout)?t.timeout:DEFAULT_TIMEOUT_SECS,disableTimeFilter:t.disableTimeFilter??true,useRoundRobinDns:t.useRoundRobinDns??false,retryRules:t?.retryRules||{type:"backoff",codes:[429,503]}};if(t.earliest){a.collectRequestParams.push({name:"earliest_time",value:t.earliest})}if(t.latest){a.collectRequestParams.push({name:"latest_time",value:t.latest})}let n=t.outputMode||"json";a.collectRequestParams.push({name:"output_mode",value:n});a.collectRequestParams.push(...t.collectRequestParams??[]);a.collectRequestHeaders.push(...t.collectRequestHeaders??[]);if(t.authentication==="token"||t.authentication==="tokenSecret"){a.token=t?.token;if(!a.token.startsWith("Bearer ")&&!a.token.startsWith("Splunk ")){a.token="Bearer ".concat(a.token)}delete a["password"];delete a["username"]}return{conf:a}}exports.init=async e=>{const t=getCollectorConfig(e);return restC.init(t)};exports.discover=async e=>restC.discover(e);exports.collect=async(e,t)=>restC.collect(e,t);exports.getParser=e=>restC.getParser(e);