# Custom Version of [Kar0218's Host](https://github.com/kar0218.github.io/672)

## Features

### [BZip2 Decompression Library](./js/bzip.js)

This JS implementation of bzip2 decompression provides a client-side implementation for decompressing `.bz2` compressed binary `.bin` payload files.
This allows us to compress all the Payload Files, speeding up the Site Resources Caching Process.

### How does the Decompression Process work?

1. **Reading the Block Header**:
   - Checks for the block magic number (`0x314159265359`).
   - Ignores CRC codes and checks for an obsolete version bit.
   - Reads the original pointer to the position in the buffer.

2. **Symbol Mapping**:
   - Creates a mapping of symbols to bytes.
   - Handles multiple Huffman coding groups and selectors.

3. **Huffman Decoding**:
   - Constructs Huffman coding tables for each group.
   - Decodes the compressed data using these tables.

4. **Move-To-Front (MTF) and Run-Length Encoding (RLE)**:
   - Applies MTF and RLE transformations to get the original byte sequence.

5. **Output Generation**:
   - Constructs the output from the decoded symbols.
   - Handles edge cases and errors during decompression.

# Credits

Kar0218
