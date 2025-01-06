exports.name="Eval";exports.version="0.4";exports.disabled=false;exports.group="Standard";exports.sync=true;const{Expression,NestedPropertyAccessor}=C.expr;const cLogger=C.util.getLogger("func:eval");const WRITE_ACCESSOR_MAP_MAX_SIZE=2048;const CTRL_PREFIX="_ctrl.";const E_NOTATION_REGEXP=/__e\[__e\[("(.+)")|('(.+)')\]\]/;let fields2add=[];let fields2remove=[];let WL2remove=null;let WL2keep=null;let writeAccessorMap=null;function getAccessor(e){if(e){const s=e.match(E_NOTATION_REGEXP);if(s){e=s[2]??s[4];if(writeAccessorMap==null){writeAccessorMap=new Map}cLogger.debug("creating indirect addressing",{indirectName:e});return{readAccessor:new NestedPropertyAccessor(e),set:function(e,s){const r=this.readAccessor.get(e);if(r!=null){let t=writeAccessorMap.get(r);if(t==null){if(writeAccessorMap.size>=WRITE_ACCESSOR_MAP_MAX_SIZE){cLogger.debug("clearing out NPA cache for indirect addressing",{cacheSize:writeAccessorMap.size});writeAccessorMap=new Map}t=new NestedPropertyAccessor(r);writeAccessorMap.set(r,t)}t.set(e,s)}}}}return new NestedPropertyAccessor(e)}return e}exports.init=e=>{const s=e.conf;fields2add=[];fields2remove=[];WL2remove=null;WL2keep=null;const r=[];const t=[];(s.add||[]).forEach((e=>{if(e.disabled)return;e.name=(e.name||"").trim();const s=e.name.startsWith(CTRL_PREFIX);r.push(s);r.push(s?e.name.substr(CTRL_PREFIX.length):getAccessor(e.name));r.push(new Expression(`${e.value}`,{disallowAssign:true}))}));const i=[];(s.remove||[]).forEach((e=>{e=(e||"").trim();if(e.indexOf("*")>-1){i.push(e)}else{t.push(e)}}));const n=(s.keep||[]).map((e=>e.trim())).filter((e=>e.length));if(n.length>0){WL2keep=new C.util.WildcardList(n)}if(i.length>0){WL2remove=new C.util.WildcardList(i,n)}fields2add=r;fields2remove=t.filter((e=>!WL2keep||!WL2keep.test(e))).map(getAccessor)};exports.process=e=>{if(!e)return e;for(let s=2;s<fields2add.length;s+=3){const r=fields2add[s-1];const t=fields2add[s].evalOn(e);if(!fields2add[s-2]){if(r)r.set(e,t)}else{e.__setCtrlField(r,t)}}for(let s=0;s<fields2remove.length;s++){fields2remove[s].set(e,undefined)}if(WL2remove){e.__traverseAndUpdate(5,((e,s)=>WL2remove.test(e)?undefined:s))}return e};