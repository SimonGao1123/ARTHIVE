import { DirectUpload, type DirectUploadDelegate } from "@rails/activestorage";

// TODO: change to the production URL
const DIRECT_UPLOAD_URL = "http://localhost:3000/rails/active_storage/direct_uploads";
export function uploadFileToS3(file: File, jwt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const delegate: DirectUploadDelegate = {
            directUploadWillCreateBlobWithXHR: (xhr: XMLHttpRequest) => {
                xhr.setRequestHeader("Authorization", `Bearer ${jwt}`)
            }, 
            directUploadWillStoreFileWithXHR: (xhr: XMLHttpRequest) => {
                xhr.upload.addEventListener("progress", (e: ProgressEvent) => {
                    if (e.lengthComputable) {
                        const pct = Math.round((e.loaded / e.total) * 100);
                        console.log(`upload ${pct}%`)
                    }
                });
            },
        };

        const upload = new DirectUpload(file, DIRECT_UPLOAD_URL, delegate);
        upload.create((error, blob) => {
            if (error) reject(error);
            else resolve(blob.signed_id)
        });
    });
}