exports.name="No Data Received";exports.type="metric";exports.category="sources";let name;let __workerGroup;let timeWindow;exports.init=e=>{const t=e.conf||{};({name,__workerGroup,timeWindow}=t);timeWindow=timeWindow||"60s"};exports.build=()=>{let e=`(_metric === 'total.in_bytes' || _metric === 'health.inputs') && input === '${name}'`;let t=`'Source ${name} had no traffic for ${timeWindow}'`;const i=[{name:"input",value:`'${name}'`},{name:"_metric",value:`'total.in_bytes'`}];if(__workerGroup){e=`(${e}) && __worker_group === '${__workerGroup}'`;t=`'Source ${name} in group ${__workerGroup} had no traffic for ${timeWindow}'`}i.push({name:"_raw",value:t});return{filter:e,pipeline:{conf:{functions:[{id:"aggregation",conf:{timeWindow,aggregations:["sum(_value).where(_metric==='total.in_bytes').as(bytes)","perc(95, _value).where(_metric==='health.inputs').as(health)"],lagTolerance:"20s",idleTimeLimit:"20s"}},{id:"drop",filter:"bytes > 0"},{id:"eval",conf:{add:i}}]}}}};