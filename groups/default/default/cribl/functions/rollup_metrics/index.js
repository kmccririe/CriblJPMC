exports.name="Rollup Metrics";exports.version="0.1";exports.group="Advanced";exports.handleSignals=true;exports.sync=true;const{Expression,NestedPropertyAccessor}=C.expr;const cLogger=C.util.getLogger("func:rollup_metrics");let dimFilter;let timeWindow;let rollup;let nextFlushTime;exports.init=e=>{const t=e.conf||{};timeWindow=C.util.parseTimeStringToSeconds(t.timeWindow||"60s");const n=(t.dimensions||[]).map((e=>e.trim())).filter((e=>e.length));if(n.length===0)n.push("*");if(n.length===1&&n[0]==="*"){dimFilter=undefined}else{const e=new C.util.WildcardList(n);dimFilter=e.test.bind(e)}rollup=new C.internal.MetricsRollup(t.gaugeRollup,dimFilter);nextFlushTime=Date.now()+timeWindow*1e3};exports.process=e=>{const t=e.__signalEvent__;if(["close","final"].includes(t)||Date.now()>nextFlushTime){nextFlushTime+=timeWindow*1e3;const t=rollup.add(e);const n=rollup.output();if(!t)n.push(e);return n.length===1?n[0]:n}if(t)return e;if(rollup.add(e))return undefined;return e};exports.unload=()=>{};