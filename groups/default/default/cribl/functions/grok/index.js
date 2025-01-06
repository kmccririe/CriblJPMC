exports.name="Grok";exports.version="0.2";exports.group="Standard";exports.sync=true;const{GrokRule}=C;const{NestedPropertyAccessor}=C.expr;const dLogger=C.util.getLogger("func:grok");const DEFAULT_FIELD="_raw";let srcField;let overwrite=false;let rules=[];exports.init=e=>{const r=e.conf||{};overwrite=r.overwrite;srcField=new NestedPropertyAccessor(r.source||DEFAULT_FIELD);let t=[r.pattern];if(r.patternList){t=t.concat((r.patternList||[]).map((e=>e.pattern)))}return GrokRule.buildMany(t).then((e=>{rules=e;dLogger.debug("init",{rules,srcField})}))};exports.process=e=>{const r=srcField.get(e);if(r==null)return e;const t=String(r);for(let r=0;r<rules.length;r++){const s=rules[r].exec(t);if(!s||!s.groups)continue;dLogger.debug("process",{execArray:s,groups:s.groups});const o=Object.keys(s.groups);for(let r=0;r<o.length;r++){const t=o[r];e[t.replace(/\\W+/g,"_")]=s.groups[t]}}return e};