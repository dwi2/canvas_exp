WebSocketDecoder = function () {
  'use strict';
  var self = this;
  self.in_node_js = (typeof window === 'undefined');
};

WebSocketDecoder.prototype.unmask = function (masked_data) {
  var self = this,
    data = null,
    mask_key = null,
    payload_length = null,
    header = null,
    unmasked = null,
    text = '',
    i = 0;
  try {
    if (self.in_node_js && masked_data instanceof Buffer) { 
      // in NodeJS and type of masked_data is Buffer
      // do some process (e.g. trim one leading character)
      data = masked_data.toString().substring(1);
    } else {
      data = masked_data;
    }
    if (data && data.length > 16) {
      payload_length = parseInt(data.substring(2, 4), 16) & 0x7f;
      if (payload_length < 126) {
        //console.log('mask_key = ' + data.substring(4, 12));
        mask_key = parseInt(data.substring(4, 12), 16);
        text = '';
        for(i = 12; i + 8 < payload_length * 4; i += 8) {
          unmasked = parseInt(data.substring(i, i + 8), 16) ^ mask_key;
          //console.log(unmasked.toString(16));
          text += 
            String.fromCharCode(((unmasked >>> 24) & 0xff))
            + String.fromCharCode(((unmasked >>> 16) & 0xff))
            + String.fromCharCode(((unmasked >>> 8) & 0xff))
            + String.fromCharCode((unmasked & 0xff))
        }
        //console.log(text);
      } else {
      console.log("masked data with payload length larger than 125 is currently not supported");
      }
    }
  } catch (e) {
    console.log(e.message);
  }
  return text;
};

(function () {
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
