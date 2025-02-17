var bzip2 = {};

bzip2.array = function (bytes) {
  var bit = 0;
  var byte = 0;
  var BITMASK = [0, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff];
  return function (n) {
    var result = 0;
    while (n > 0) {
      var left = 8 - bit;
      if (n >= left) {
        result <<= left;
        result |= BITMASK[left] & bytes[byte++];
        bit = 0;
        n -= left;
      } else {
        result <<= n;
        result |=
          (bytes[byte] & (BITMASK[n] << (8 - n - bit))) >> (8 - n - bit);
        bit += n;
        n = 0;
      }
    }
    return result;
  };
};

bzip2.simple = function (bits) {
  var size = bzip2.header(bits);
  var all = [];
  var chunk = [];
  do {
    all = all.concat(chunk);
    chunk = bzip2.decompress(bits, size);
  } while (chunk != -1);
  return Uint8Array.from(all);
};

bzip2.header = function (bits) {
  if (bits(8 * 3) != 4348520) throw "No magic number found.";
  var i = bits(8) - 48;
  if (i < 1 || i > 9) throw "Not a bzip2 archive.";
  return i;
};

// Param1: a function for reading the block data (starting with 0x314159265359)
// Param2: block size (0-9) (optional, defaults to 9)
// Param3: length at which to stop decompressing and return the output
bzip2.decompress = function (bits, size, len) {
  var MAX_HUFCODE_BITS = 20;
  var MAX_SYMBOLS = 258;
  var SYMBOL_RUNA = 0;
  var SYMBOL_RUNB = 1;
  var GROUP_SIZE = 50;

  var bufsize = 100000 * size;
  for (var h = "", i = 0; i < 6; i++) h += bits(8).toString(16);
  if (h == "177245385090") return -1; // Last block
  if (h != "314159265359") throw "Not valid bzip2 data.";
  bits(32); // Ignore CRC codes
  if (bits(1)) throw "Unsupported obsolete version.";
  var origPtr = bits(24);
  if (origPtr > bufsize) throw "Initial position larger than buffer size.";
  var t = bits(16);
  var symToByte = new Uint8Array(256),
    symTotal = 0;
  for (i = 0; i < 16; i++) {
    if (t & (1 << (15 - i))) {
      var k = bits(16);
      for (j = 0; j < 16; j++) {
        if (k & (1 << (15 - j))) {
          symToByte[symTotal++] = 16 * i + j;
        }
      }
    }
  }

  var groupCount = bits(3);
  if (groupCount < 2 || groupCount > 6) throw "Error 1 while decompressing.";
  var nSelectors = bits(15);
  if (nSelectors == 0) throw "Error 2 while decompressing.";
  var mtfSymbol = []; // TODO: possibly replace JS array with typed arrays
  for (var i = 0; i < groupCount; i++) mtfSymbol[i] = i;
  var selectors = new Uint8Array(32768);

  for (var i = 0; i < nSelectors; i++) {
    for (var j = 0; bits(1); j++)
      if (j >= groupCount) throw "Error 3 while decompressing.";
    var uc = mtfSymbol[j];
    mtfSymbol.splice(j, 1); // This is a probably inefficient MTF transform
    mtfSymbol.splice(0, 0, uc);
    selectors[i] = uc;
  }

  var symCount = symTotal + 2;
  var groups = [];
  for (var j = 0; j < groupCount; j++) {
    var length = new Uint8Array(MAX_SYMBOLS),
      temp = new Uint8Array(MAX_HUFCODE_BITS + 1);
    t = bits(5); // Lengths
    for (var i = 0; i < symCount; i++) {
      while (true) {
        if (t < 1 || t > MAX_HUFCODE_BITS) throw "Error 4 while decompressing.";
        if (!bits(1)) break;
        if (!bits(1)) t++;
        else t--;
      }
      length[i] = t;
    }
    var minLen, maxLen;
    minLen = maxLen = length[0];
    for (var i = 1; i < symCount; i++) {
      if (length[i] > maxLen) maxLen = length[i];
      else if (length[i] < minLen) minLen = length[i];
    }
    var hufGroup;
    hufGroup = groups[j] = {};
    hufGroup.permute = new Uint32Array(MAX_SYMBOLS);
    hufGroup.limit = new Uint32Array(MAX_HUFCODE_BITS + 1);
    hufGroup.base = new Uint32Array(MAX_HUFCODE_BITS + 1);
    hufGroup.minLen = minLen;
    hufGroup.maxLen = maxLen;
    var base = hufGroup.base.subarray(1);
    var limit = hufGroup.limit.subarray(1);
    var pp = 0;
    for (var i = minLen; i <= maxLen; i++)
      for (var t = 0; t < symCount; t++)
        if (length[t] == i) hufGroup.permute[pp++] = t;
    for (i = minLen; i <= maxLen; i++) temp[i] = limit[i] = 0;
    for (i = 0; i < symCount; i++) temp[length[i]]++;
    pp = t = 0;
    for (i = minLen; i < maxLen; i++) {
      pp += temp[i];
      limit[i] = pp - 1;
      pp <<= 1;
      base[i + 1] = pp - (t += temp[i]);
    }
    limit[maxLen] = pp + temp[maxLen] - 1;
    base[minLen] = 0;
  }
  var byteCount = new Uint32Array(256);
  for (var i = 0; i < 256; i++) mtfSymbol[i] = i;
  var runPos, count, symCount, selector;
  runPos = count = symCount = selector = 0;
  var buf = new Uint32Array(bufsize);
  while (true) {
    if (!symCount--) {
      symCount = GROUP_SIZE - 1;
      if (selector >= nSelectors) throw "Error 5 while decompressing.";
      hufGroup = groups[selectors[selector++]];
      base = hufGroup.base.subarray(1);
      limit = hufGroup.limit.subarray(1);
    }
    i = hufGroup.minLen;
    j = bits(i);
    while (true) {
      if (i > hufGroup.maxLen) throw "Error 6 while decompressing.";
      if (j <= limit[i]) break;
      i++;
      j = (j << 1) | bits(1);
    }
    j -= base[i];
    if (j < 0 || j >= MAX_SYMBOLS) throw "Error 7 while decompressing.";
    var nextSym = hufGroup.permute[j];
    if (nextSym == SYMBOL_RUNA || nextSym == SYMBOL_RUNB) {
      if (!runPos) {
        runPos = 1;
        t = 0;
      }
      if (nextSym == SYMBOL_RUNA) t += runPos;
      else t += 2 * runPos;
      runPos <<= 1;
      continue;
    }
    if (runPos) {
      runPos = 0;
      if (count + t >= bufsize) throw "Error 8 while decompressing.";
      uc = symToByte[mtfSymbol[0]];
      byteCount[uc] += t;
      while (t--) buf[count++] = uc;
    }
    if (nextSym > symTotal) break;
    if (count >= bufsize) throw "Error 9 while decompressing.";
    i = nextSym - 1;
    uc = mtfSymbol[i];
    mtfSymbol.splice(i, 1);
    mtfSymbol.splice(0, 0, uc);
    uc = symToByte[uc];
    byteCount[uc]++;
    buf[count++] = uc;
  }
  if (origPtr < 0 || origPtr >= count) throw "Error 10 while decompressing.";
  var j = 0;
  for (var i = 0; i < 256; i++) {
    k = j + byteCount[i];
    byteCount[i] = j;
    j = k;
  }
  for (var i = 0; i < count; i++) {
    uc = buf[i] & 0xff;
    buf[byteCount[uc]] |= i << 8;
    byteCount[uc]++;
  }
  var pos = 0,
    current = 0,
    run = 0;
  if (count) {
    pos = buf[origPtr];
    current = pos & 0xff;
    pos >>= 8;
    run = -1;
  }
  count = count;
  var output = [];
  var copies, previous, outbyte;
  if (!len) len = Infinity;
  while (count) {
    count--;
    previous = current;
    pos = buf[pos];
    current = pos & 0xff;
    pos >>= 8;
    if (run++ == 3) {
      copies = current;
      outbyte = previous;
      current = -1;
    } else {
      copies = 1;
      outbyte = current;
    }
    while (copies--) {
      output.push(outbyte);
      if (!--len) return output;
    }
    if (current != previous) run = 0;
  }
  return output;
};
