declare module "@rails/activestorage" {
  export interface DirectUploadBlob {
    id: number
    key: string
    filename: string
    content_type: string
    byte_size: number
    checksum: string
    signed_id: string
  }

  export interface DirectUploadDelegate {
    directUploadWillCreateBlobWithXHR?(xhr: XMLHttpRequest): void
    directUploadWillStoreFileWithXHR?(xhr: XMLHttpRequest): void
  }

  export type DirectUploadCallback = (
    error: string | null,
    blob: DirectUploadBlob
  ) => void

  export class DirectUpload {
    id: number
    file: File
    url: string
    delegate?: DirectUploadDelegate
    customHeaders: Record<string, string>

    constructor(
      file: File,
      url: string,
      delegate?: DirectUploadDelegate,
      customHeaders?: Record<string, string>
    )

    create(callback: DirectUploadCallback): void
  }
}
