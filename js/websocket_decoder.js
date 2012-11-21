WebSocketDecoder = function () {
  'use strict';
  var self = this;
  self.in_node_js = (typeof window === 'undefined');
};

WebSocketDecoder.prototype.unmask = function (masked_data) {
  'use strict';
  var self = this,
    data = null,
    mask_key = null,
    payload_length = null,
    header = null,
    unmasked = null,
    is_masked = false,
    is_text = false,
    text = '',
    i = 0,
    j = 0;
  try {
    if (self.in_node_js && masked_data instanceof Buffer) {
      // in NodeJS and type of masked_data is Buffer
      // do some process (e.g. trim one leading character)
      data = masked_data.toString().substring(1);
    } else {
      data = masked_data;
    }
    if (data && data.length > 16) {
      is_masked = (parseInt(data.substring(2, 4), 16) & 0x80) > 0;
      is_text = (parseInt(data.substring(0, 2), 16) & 0x1) === 1;
      if (!is_text) {
        throw {message: 'Only accept text frame!', name: 'InvalidFormatError'};
      }
      if (is_masked) {
        payload_length = parseInt(data.substring(2, 4), 16) & 0x7f;
        if (payload_length < 126) {
          mask_key = [];
          mask_key.push(parseInt(data.substring(4, 6), 16));
          mask_key.push(parseInt(data.substring(6, 8), 16));
          mask_key.push(parseInt(data.substring(8, 10), 16));
          mask_key.push(parseInt(data.substring(10, 12), 16));
          text = '';
          j = 0;
          for (i = 12; i < data.length; i += 2) {
            // According to RFC 6455 5.3 Client-to-Server Masking(page 33)
            // j = i mod 4
            // transformed-octet-i  = original-octet-i xor masking-key-octet-j
            unmasked = parseInt(data.substring(i, i + 2), 16) ^ mask_key[j];
            text += String.fromCharCode((unmasked & 0xff));
            j = (j + 1) & 0x3;
          }
          //console.log(text);
        } else {
          console.log("masked data with payload length larger than 125 is currently not supported");
        }
      } else {
        // data without masking
        text = '';
        unmasked = parseInt(data.substring(i, i + 2), 16);
        for (i = 4; i < data.length; i += 2) {
          text += String.fromCharCode((unmasked >>> 8) * 0xff)
            + String.fromCharCode((unmasked & 0xff));
        }
      }
    }
  } catch (e) {
    console.log(e.message);
  }
  return text;
};

(function () {
  'use strict';
  var decoder = new WebSocketDecoder(),
    result = '';
  if (decoder.in_node_js) {
    process.argv.forEach(function (val, index, array) {
      if (index > 1 && val && val.length > 0) {
        console.log(decoder.unmask(val));
      }
    });
  } else {
    result =
      decoder.unmask("81b538bd92d6439fe6af48d8b0ec0a8ba2fa1acdf3af54d2f3b21a87e9f45ed1f3b14b9fa8e40889aafa1ac5b0ec0f8da0fa1ac4b0ec0b85a7ab45");
  }
}());
