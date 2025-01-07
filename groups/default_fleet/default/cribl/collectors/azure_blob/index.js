exports.name="Azure Blob";exports.version="0.2";exports.disabled=false;exports.destroyable=false;let authType;let conf;let dir;let filter;let extractors;let provider;let batchSize;let connectionString;let containerName;let mockClient;exports.init=e=>{conf=e.conf;dir=conf.path||"";filter=conf.filter||"true";batchSize=conf.maxBatchSize||10;mockClient=conf.mockClient;authType=conf.authType??"manual";connectionString=conf.connectionString||process.env.AZURE_STORAGE_CONNECTION_STRING;containerName=C.expr.runExprSafe(conf.containerName);if(authType==="manual"||authType==="secret"){if(!connectionString){throw new Error("Invalid Config - connectionString not defined and not found in AZURE_STORAGE_CONNECTION_STRING environment variable")}}else if(authType==="clientSecret"){["tenantId","clientId","clientSecretValue","storageAccountName"].forEach((e=>{if(!(e in conf)){throw new Error(`Invalid Config - missing field ${e} which is required for client secret auth`)}}))}else if(authType==="clientCert"){["tenantId","clientId","certificate","storageAccountName"].forEach((e=>{if(!(e in conf)){throw new Error(`Invalid Config - missing field ${e} which is required for client certificate auth`)}}))}if(!containerName){throw new Error("Invalid Config - missing container name")}const t=createCredentials();provider=C.internal.Path.AzureBlobProvider({recurse:conf.recurse||false,containerName,credential:t,mockClient,includeMetadata:conf.includeMetadata!=null?conf.includeMetadata:true,includeTags:conf.includeTags!=null?conf.includeTags:true,parquetChunkSizeMB:conf.parquetChunkSizeMB,parquetChunkDownloadTimeout:conf.parquetChunkDownloadTimeout});if(conf.extractors){extractors={};const{Expression:e}=C.expr;conf.extractors.forEach((t=>{extractors[t.key]=new e(t.expression)}))}exports.provider=provider;return provider.init()};function createCredentials(){if(authType==="manual"||authType==="secret"){return{authenticationMethod:"connection_string",connectionString}}else if(authType==="clientSecret"){return{authenticationMethod:"client_secret",storageAccountName:conf.storageAccountName,tenantId:conf.tenantId,clientId:conf.clientId,clientSecret:conf.clientSecretValue}}else if(authType==="clientCert"){return{authenticationMethod:"certificate",storageAccountName:conf.storageAccountName,tenantId:conf.tenantId,clientId:conf.clientId,certificateName:conf.certificate.certificateName,certPath:conf.certificate.certPath,privKeyPath:conf.certificate.privKeyPath,passphrase:conf.certificate.passphrase}}else{throw new Error("Unexpected authType "+authType)}}function reportErrorIfAny(e,t){if(t==null)return;e.reportError(t).catch((()=>{}))}exports.discover=async e=>{const t=C.internal.Path.pathFilter(dir,filter,provider,e.logger(),extractors);let n=await t.getNextPath();reportErrorIfAny(e,t.getLastError());const r=[];while(!n.done){const o={source:n.val,...n.meta};if(o.properties?.accessTier=="Archive"){e.logger().warn("Discovered blob in Archive Tier, which does not support direct download, skipping.",{result:o})}else{if(n.meta.fields)o.fields=n.meta.fields;if(n.val.endsWith(".gz"))o.compression="gzip";C.internal.Parquet.isParquetFile(n.val)?o.format="events":o.format="raw";r.push(o)}if(r.length>=batchSize){await e.addResults(r);r.length=0}n=await t.getNextPath();reportErrorIfAny(e,t.getLastError())}await e.addResults(r)};exports.collect=async(e,t)=>{t.logger().debug("Downloading blob",{name:e.name});return new Promise(((n,r)=>{const o=e=>{if(e?.code==="ConditionNotMet"||e?.details?.errorCode==="ConditionNotMet"){e=new Error("The ETag of the blob is updated due to metadata or content in the blob changed by another operation(s) during downloading. Please retry it.")}r(e)};try{const r=provider.createReadStream(e,t);r.once("error",o);r.once("readable",(()=>{r.off("error",o);n(r)}))}catch(e){o(e)}}))};exports.close=async()=>{await provider.close().catch((e=>{}))};