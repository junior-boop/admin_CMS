export function createMediaClient(bucket, publicUrlBase) {
    function generateKey(contentType) {
        const ext = contentType?.split('/')[1] ?? 'bin';
        return `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    }
    async function toArrayBuffer(input) {
        if (input instanceof ArrayBuffer)
            return input;
        if (input instanceof Blob)
            return input.arrayBuffer();
        const reader = input.getReader();
        const chunks = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            if (value)
                chunks.push(value);
        }
        const total = chunks.reduce((n, c) => n + c.byteLength, 0);
        const buf = new Uint8Array(total);
        let offset = 0;
        for (const chunk of chunks) {
            buf.set(chunk, offset);
            offset += chunk.byteLength;
        }
        return buf.buffer;
    }
    return {
        async upload(file, options = {}) {
            const buf = await toArrayBuffer(file);
            const key = options.key ?? generateKey(options.contentType);
            const putOptions = {
                httpMetadata: { contentType: options.contentType ?? 'application/octet-stream' },
            };
            if (options.metadata)
                putOptions.customMetadata = options.metadata;
            await bucket.put(key, buf, putOptions);
            return {
                key,
                url: `${publicUrlBase}/${key}`,
                size: buf.byteLength,
                contentType: options.contentType ?? 'application/octet-stream',
                uploadedAt: new Date().toISOString(),
            };
        },
        getUrl(key) {
            return `${publicUrlBase}/${key}`;
        },
        async delete(key) {
            await bucket.delete(key);
        },
        async list(prefix) {
            const listOptions = {};
            if (prefix)
                listOptions.prefix = prefix;
            const result = await bucket.list(listOptions);
            return result.objects.map((obj) => ({
                key: obj.key,
                size: obj.size,
                uploadedAt: obj.uploaded.toISOString(),
            }));
        },
    };
}
//# sourceMappingURL=media.js.map