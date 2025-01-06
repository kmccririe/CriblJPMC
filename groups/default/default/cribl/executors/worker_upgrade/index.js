exports.jobType="task-per-node";exports.name="worker_upgrade";const os=require("os");let upgradeClient;let packages;let authToken;const{internal:{performPackageDownload}}=C;exports.initJob=async e=>{const{conf:a}=e.conf.executor;packages=[];await Promise.all(a.packages.map((async e=>{const{packageFile:a,packageUrl:r,hashUrl:t,hashFile:n,hashType:s}=e;try{await performPackageDownload(r,a,t,n,s);packages.push(e)}catch{}})));if(!packages.length)throw new Error("Failed to download packages.");authToken=a.authToken};exports.jobSeedTask=async()=>({task:{packages,authToken}});exports.initTask=async e=>{if(C.internal.newUpgradeClient){upgradeClient=C.internal.newUpgradeClient()}else{upgradeClient=new C.internal.UpgradeClient}};exports.jobOnError=async(e,a,r)=>{};exports.taskExecute=async(e,a)=>{const r=e.logger();const t=[os.platform(),os.arch()];const n=a.packages.find((e=>e.variant[0]===t[0]&&e.variant[1]===t[1]));if(!n){e.reportError(new Error(`Could not find a suitable package for ${t.join(", ")}`),"TASK_FATAL");return}r.info("task opts",{opts:a});let s;if(typeof upgradeClient.performUpgrade==="function"){s=await upgradeClient.performUpgrade(n,a,r);if(!s.canUpgrade){r.info(s.message);e.addResult(s);return}}else{const t={packageUrl:n.localPackageUrl,hashUrl:n.localHashUrl,version:n.version};r.info("Checking upgradeability",t);s=await upgradeClient.checkUpgradePath(t,r);if(!s.canUpgrade){r.info(s.message);e.addResult(s);return}r.info("Fetching assets");const o=await upgradeClient.downloadAssets(t,a.authToken);r.info("Fetched assets",o);if(t.hashUrl){r.info("Verifying assets");await upgradeClient.verifyAssets(o);r.info("Assets verified")}r.info("Proceeding to installation");s=await upgradeClient.installPackage(o,s)}r.info(s.message);if(!s.isSuccess){e.reportError(new Error(s.message),"TASK_FATAL");return}await e.addResult(s);setImmediate((()=>upgradeClient.restartServer().catch((()=>{}))))};