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
      flip: function(pos) {
        var found = false;
        for(var i=0; i<this.blacken_pos.length; i++) {
          if (this.blacken_pos[i].x === pos.x && this.blacken_pos[i].y === pos.y) {
            this.blacken_pos.splice(i,1);
            found = true;
            break;
          }
        }
        this.blacken_pos = (found ? this.blacken_pos: this.blacken_pos.concat(pos));
        _L_.ctx.fillStyle= (found ? this.white : this.black);
        _L_.ctx.fillRect(+(pos.x)+1, +(pos.y)+1, +(_L_.grid_span)-1, +(_L_.grid_span)-1);
      },
      blacken_pos: []
    },
    mouse: {
      downed: false
    },
    dummy: null
  };
})();
$(document).ready(function(){
  if (!_L_.detection.supports_canvas()){
    alert("Please upgrade your browser to IE 9");
  }
  _L_.draw_base();
  $('canvas#cv').bind('click', function(e){
    var cv = this;
    var pos = _L_.get_nearest_left_top(e.pageX-cv.offsetLeft, e.pageY-cv.offsetTop);
    _L_.color.flip(pos);
  });
  $('button#reset_canvas').click(function(e){
    // reset canvas
    _L_.ctx.canvas.width= +(_L_.ctx.canvas.width);
    _L_.draw_base();
  });
});