(function(){
  if (window.console === null || window.console === undefined){
    window.console = {};
  }
  // detect canvas!
  _L_ = {
    detection: {
      supports_canvas: function() {
        return !!document.createElement('canvas').getContext;
      }
    },
    grid_span: 10,
    draw_base: function() {
      var cv = $('canvas#cv')[0];
      var ctx = cv.getContext('2d');
      this.ctx = ctx;

      for (var x = 0.5; x < cv.width; x += this.grid_span) {
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, cv.height);
      }
      for (var y = 0.5; y < cv.height; y += this.grid_span) {
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(cv.width, y);
      }
      this.ctx.strokeStyle = "#888";
      this.ctx.stroke();
    },
    adj_coord: function(n) {
      return +(n);
    },
    get_nearest_left_top: function(x, y){
      var rx = (Math.floor(x/this.grid_span))*this.grid_span;
      var ry = (Math.floor(y/this.grid_span))*this.grid_span;
      return {x:this.adj_coord(rx), y:this.adj_coord(ry)};
    },
    color: {
      black: '#000',
      white: '#eee',
      find_loc_in_blackened: function(pos) {
        var ind = -1;
        for(var i=0; i<this.blacken_pos.length; i++) {
          if (this.blacken_pos[i].x === pos.x && this.blacken_pos[i].y === pos.y) {
            ind = i;
            break;
          }
        }
        return ind;
      },
      flip: function(pos) {
        var loc = this.find_loc_in_blackened(pos);
        var found = ((loc >= 0) ? true : false);
        if (found) 
          this.blacken_pos.splice(loc, 1);
        this.blacken_pos = (found ? this.blacken_pos: this.blacken_pos.concat(pos));
        _L_.ctx.fillStyle= (found ? this.white : this.black);
        _L_.ctx.fillRect(+(pos.x)+1, +(pos.y)+1, +(_L_.grid_span)-1, +(_L_.grid_span)-1);
      },
      blacken_pos: []
    },
    game_rules: {
      is_valid_pos: function(pos) {
        if (pos === null || pos.x === null 
          || pos.y === null || pos.x % _L_.grid_span != 0 || pos.y % _L_.grid_span != 0) {
          return false;
        }
        return true;
      },
      is_alive: function(pos) {
        if (this.is_valid_pos(pos) && _L_.color.find_loc_in_blackened(pos) >= 0)
          return true;
        return false;
      },
      count_alive_neighbors: function(pos) {
        if (!this.is_valid_pos(pos)) 
          return 0;
        var neighbors = {
          //|--------------|
          //| n1 | n2 | n3 |
          //|----|----|----|
          //| n4 | x  | n5 |
          //|----|----|----|
          //| n6 | n7 | n8 | 
          //|----|----|----|          
              n1: {x: pos.x-_L_.grid_span, y: pos.y-_L_.grid_span},
              n2: {x: pos.x, y: pos.y-_L_.grid_span},
              n3: {x: pos.x+_L_.grid_span, y: pos.y-_L_.grid_span},
              n4: {x: pos.x-_L_.grid_span, y: pos.y},
              n5: {x: pos.x+_L_.grid_span, y: pos.y},
              n6: {x: pos.x-_L_.grid_span, y: pos.y+_L_.grid_span},
              n7: {x: pos.x, y: pos.y+_L_.grid_span},
              n8: {x: pos.x+_L_.grid_span, y: pos.y+_L_.grid_span}
            };
        var cnt = 0;
        for (var n in neighbors) {
          cnt += ((_L_.color.find_loc_in_blackened(neighbors[n]) >= 0) ? 1 : 0);
        }
        return cnt;
      },
      transition: function() {
        var next_round = [];

      }
    },
    mouse: {
      downed: false
    },
    bind_canvas_event: function(){
      $('canvas#cv').bind('click', function(e){
        var cv = this;
        var pos = _L_.get_nearest_left_top(e.pageX-cv.offsetLeft, e.pageY-cv.offsetTop);
        _L_.color.flip(pos);
      });
      $('button#reset_canvas').bind('click', function(e){
        // reset canvas
        _L_.ctx.canvas.width= +(_L_.ctx.canvas.width);
        _L_.color.blacken_pos = [];
        _L_.draw_base();
      });
    },
    unbind_canvas_event: function() {
       $('canvas#cv').unbind('click');
       $('button#reset_canvas').unbind('click');
    },
    started: false,
    dummy: null
  };
})();
$(document).ready(function(){
  if (!_L_.detection.supports_canvas()){
    alert("Your browser does NOT SUPPORT canvas, please UPGRADE!");
  }
  _L_.draw_base();
  _L_.bind_canvas_event();
  $('button#start').click(function(e){
    if (!_L_.started) {
      $(this).html('STOP');
      _L_.unbind_canvas_event();
      $('button#reset_canvas').attr('disabled', 'disabled');
    }
    else {
      $(this).html('START'); 
      _L_.bind_canvas_event();
      $('button#reset_canvas').removeAttr('disabled');
    }
    _L_.started = !_L_.started;
  });
});