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
        if (!_L_.game_rules.is_valid_pos(pos))
          return;
        var ind = -1;
        for(var i=0; i<this.blacken_pos.length; i++) {
          if (this.blacken_pos[i].x === pos.x && this.blacken_pos[i].y === pos.y) {
            ind = i;
            break;
          }
        }
        return ind;
      },
      to_white: function(pos) {
        // NOTE: this function DID NOT record pos into blacken_pos, change color only
        // use it with cautious
        if (!_L_.game_rules.is_valid_pos(pos))
          return;
        _L_.ctx.fillStyle = this.white;
        _L_.ctx.fillRect(+(pos.x)+1, +(pos.y)+1, +(_L_.grid_span)-1, +(_L_.grid_span)-1);
      },
      to_black: function(pos) {
        // NOTE: this function DID NOT record pos into blacken_pos, change color only
        // use it with cautious
        if (!_L_.game_rules.is_valid_pos(pos))
          return;
        _L_.ctx.fillStyle = this.black;
        _L_.ctx.fillRect(+(pos.x)+1, +(pos.y)+1, +(_L_.grid_span)-1, +(_L_.grid_span)-1);
      },
      flip: function(pos) {
        if (!_L_.game_rules.is_valid_pos(pos))
          return;
        var loc = this.find_loc_in_blackened(pos);
        var found = ((loc >= 0) ? true : false);
        if (found) 
          this.blacken_pos.splice(loc, 1);
        this.blacken_pos = (found ? this.blacken_pos: this.blacken_pos.concat(pos));
        _L_.ctx.fillStyle = (found ? this.white : this.black);
        _L_.ctx.fillRect(+(pos.x)+1, +(pos.y)+1, +(_L_.grid_span)-1, +(_L_.grid_span)-1);
      },
      blacken_pos: []
    }, // end of color
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
        // NOTICE: transition might passed as function pointer
        // please avoid to use 'this' keyword here
        var cv = $('canvas#cv')[0];
        var next_round = [];
        for (var x_=0; x_ < cv.width-1; x_+=_L_.grid_span){ // cv.width-1 is TRICKY
          for(var y_=0; y_ < cv.height-1; y_+=_L_.grid_span) { // cv.height-1 is TRICKY
            var cur = {x: x_, y: y_};
            var alive_neighbor_cnt = _L_.game_rules.count_alive_neighbors(cur);
            if (_L_.game_rules.is_alive(cur)) { // live cell
              if (alive_neighbor_cnt === 2 || alive_neighbor_cnt === 3)
                next_round.push(cur);
            }
            else { // dead cell
              if (alive_neighbor_cnt === 3) 
                next_round.push(cur);
            }
          }
        }
        // reset all to white
        for(var p_ in _L_.color.blacken_pos) {
          _L_.color.to_white(_L_.color.blacken_pos[p_]);
          
        }
        _L_.color.blacken_pos = next_round;
        for(var p_ in _L_.color.blacken_pos) {
          _L_.color.to_black(_L_.color.blacken_pos[p_]);
        }
        // TODO
      }
    }, // end of game_rules
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
        _L_.steps.reset();
        _L_.steps.show();
      });
      $('button#1_step').bind('click', function(e){
        _L_.game_rules.transition();
        _L_.steps.increase(1);
        _L_.steps.show();
      });
    },
    unbind_canvas_event: function() {
      $('canvas#cv').unbind('click');
      $('button#reset_canvas').unbind('click');
      $('button#1_step').unbind('click');
    },
    disable_all_buttons_except: function(btn_selector) {
      if (typeof s === 'string') {
        $('button').not(btn_selector).attr('disabled', 'disabled');
      }
    },
    enable_all_buttons: function() {
      $('button').removeAttr('disabled');
    },
    steps: {
      count: 0,
      speed: 300, // milliseconds
      timerId: null,
      show: function(warn) {
        $('#steps h2').html(this.count);
        if (warn === true) {
          $('#steps').removeClass().addClass('alert alert-warning');
        }
        else {
          $('#steps').removeClass().addClass('alert alert-info');
        }
      },
      increase: function(n) {
        if (typeof n === 'number'){
          this.count += Math.round(n);
        }
      },
      run: function() {
        this.timerId = window.setInterval(
          function() {
            _L_.game_rules.transition();
            _L_.steps.increase(1);
            _L_.steps.show();
            if (_L_.color.blacken_pos == null 
              || _L_.color.blacken_pos.length === 0) {
              _L_.steps.stop();
              _L_.steps.show(true);
            }
          }, 
          this.speed);
      },
      stop: function() {
        if (this.timerId != null) {
          window.clearInterval(this.timerId);
        }
        this.timerId = null;
      },
      reset: function() {
        this.count = 0;
      }
    },
    started: false,
    dummy: null
  };
})();
$(document).ready(function(){
  if (!_L_.detection.supports_canvas()){
    alert("Your browser does NOT SUPPORT canvas, please UPGRADE it!");
  }
  _L_.draw_base();
  _L_.bind_canvas_event();
  $('button#run').click(function(e){
    if (!_L_.started) {
      $(this).html('STOP');
      _L_.steps.run();
      _L_.unbind_canvas_event();
      _L_.disable_all_buttons_except('button#run');
    }
    else {
      $(this).html('RUN'); 
      _L_.steps.stop();
      _L_.bind_canvas_event();
      _L_.enable_all_buttons();
    }
    _L_.started = !_L_.started;
  });
});