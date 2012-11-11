function pd( func ) {
  return function( event ) {
    event.preventDefault() 
    func && func(event)
  }
}
//---------------------------
document.ontouchmove = pd() //override the standard touch events so we can use iScroll
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g,
  escape:      /\{\{-(.+?)\}\}/g,
  evaluate:    /\{\{=(.+?)\}\}/g
};
//--------------------------- 
var browser = {
  android: /Android/.test(navigator.userAgent)
}
browser.iphone = !browser.android
var app = { //create an empty frame for the application
  model: {},
  view: {}
}
var bb = { //create an empty frame for the bb instance of the application
  model: {},
  view: {}
}
//--------------------
bb.init = function() { //initialise the bb instance of the application
//--------------------   
  var scrollpage = { //From here...
    scroll: function() {
      var self = this
      setTimeout( function() {
        if(self.scroller) {
          self.scroller.refresh()
        }
        else {
          self.scroller = new iScroll($("div[data-role='list']")[0])
        }
      },1) //..To Here - Creates a scrollable area containing the page div using iScroll.js
	}
  }
  
//------------------------//
//-------THE MODELS-------//
//------------------------//

//------------------------------------------------- 
  bb.model.State = Backbone.Model.extend(_.extend({
//-------------------------------------------------     
    defaults: {
      items: 'loading' //sets the bb instance state to loading
    },
  }))
//------------------------------------------------- 
  bb.model.Item = Backbone.Model.extend(_.extend({    
//------------------------------------------------- 
    defaults: {
      text: '', //create the bb instance for an Item
	  done: false
    },
    initialize: function() {
      var self = this
      _.bindAll(self)
    }
  }))
//------------------------------------------------------ 
  bb.model.Items = Backbone.Collection.extend(_.extend({   
//------------------------------------------------------  
    model: bb.model.Item, //use the Item Model for structure
    localStorage: new Store("items"), //creat a new datastore called items
	initialize: function()
	{
      var self = this
      _.bindAll(self)
      self.count = 0 //set it to empty
      self.on('reset',function() {
      self.count = self.length //set the number of items to the current numer of items
      })
	  
    },
    additem: function(newtext) {
      var self = this  
      var item = new bb.model.Item({
        text: newtext
      })
      self.add(item)
      //self.count++
      item.save()
    }
  }))
  
//-----------------------//
//-------THE VIEWS-------//
//-----------------------//

//-------------------------------------------- 
  bb.view.Head = Backbone.View.extend(_.extend({    //the interface part
//-------------------------------------------- 
    events: {
	
	
	'tap #geomap': function(){ //using jquerymobile to attach a tap action to the add button div in the HTML
	        var self = this
		    self.setElement("div[data-role='page']") //the location in the HTML
			$( "#popupMap" ).popup("open") //pop up leaflet.js current location map in modal window


	//----------------------
},
	
	
	
    'tap #add': function(){ //using jquerymobile to attach a tap action to the add button div in the HTML
        var self = this
	   //---------------------- 
	   //_.bindAll(self) //takes control of the view for self calls - backbone piece
	   self.setElement("div[data-role='page']") //the location in the HTML
	   $('#newitem').slideDown(); //slide down the text box defined in the HTML
	   $('#add').toggle(); //Hide the add button after the text box appears	   
		//$('#add').addClass('display', 'none');

//---------------------- 
      },
	'tap #textbox' : function() {
		var self = this
		_.bindAll(self)
		self.setElement("div[data-role='page']")
		$('#textbox').focus();
//---------------------- 
		},
	'tap #cancel' : function() {
		var self = this
		_.bindAll(self) //takes control of the view for self calls - backbone piece
		self.setElement("div[data-role='page']")
		$('#newitem').slideUp()
		$('#textbox').val('');
		$('#add').show();
//---------------------- 
		},
	'tap #save' : function() {		
		var self = this
		_.bindAll(self)
		self.setElement("div[data-role='content']")
			var newtext = $('#textbox').val() //capture the input text value to var newtext	
			
			if (!newtext)
			    alert('You must enter some text to save an item to the ToDo list'),
				console.log('empty'),
				$('#add').toggle();

			else 
				
				self.items.additem(newtext); //add the pages of newtest to the items 
				console.log(newtext)
				$('#newitem').slideUp() //hide textbox after saving a new item
				$('#textbox').val('');
				$('#add').show();	
			}
    },
//---------------------- 
    initialize: function( items ) { 
	  var self = this
      _.bindAll(self)
   	  //var headListner = function() {self.render()} Trying to update header when item is deleted line 278
      self.items = items
      self.setElement("div[data-role='header']") //gets the header div in the HTML
      self.elem = {
        add: self.$el.find('#add'), //adds the add button in the div to the header
        title: self.$el.find('h1') //adds the header format to the header html
      }     
      self.tm = { // 
        title: _.template( self.elem.title.html() ) //underscore template for the title 
      }
      self.elem.add.hide()// hide the add button in the template 
      app.model.state.on('change:items',self.render) // refresh when an item is added 
      self.items.on('add',self.render) // 
  	},
//---------------------- 
    render: function() {
      var self = this     
      var loaded = 'loaded' == app.model.state.get('items') //check the state of the app instance
      self.elem.title.html( self.tm.title({
        title: loaded ? self.items.length+' Items' : 'Loading...'
      }) ) //uses the template to display Loading text until state changes to loaded 
      if( loaded ) {
        self.elem.add.show() //display the add button when the state is set to loaded
      }
    }    
  }))
//---------------------------------------------
 bb.view.List = Backbone.View.extend(_.extend({  
//---------------------------------------------			  
    initialize: function( items ) { //create the list
      var self = this
      _.bindAll(self)
      self.setElement('#list')
      self.items = items
      self.items.on('add',self.appenditem)
    },
    render: function() {
      var self = this
	  _.bindAll(self)
      self.$el.empty()
      self.items.each(function(item){
        self.appenditem(item)
      })
    },
    appenditem: function(item) {
      var self = this
	  _.bindAll(self)
      var itemview = new bb.view.Item({
        model: item
      })
      self.$el.append( itemview.render().el )      
      self.scroll() 
  }
},scrollpage))

//---------------------------------------------- 
  bb.view.Item = Backbone.View.extend(_.extend({ 
//---------------------------------------------- 				
	events : {
		
		'tap .tickbox'		: 'checkboxClick',
		'tap .deleteButton' : 'deleteItem',
		'swiperight'		: 'showDeleteItem',
		'swipeleft'			: 'hideDeleteItem', 
		
		
	},		
	template : _.template( $('#list').html() ),
	tagName : 'li',
	initialize: function() {
		var self = this
		_.bindAll(self)
		console.log(self)
		self.model.on('destroy', self.remove, self)
	},	
	render: function() {
		var self = this
		_.bindAll(self)
		self.$el.html(self.template(self.model.toJSON()))
		self.updatecheckboxel()
		return self
	},
	checkboxClick : function() {
		var self = this
		_.bindAll(self)
		var checkboxstate = self.model.get('done')
		//
		self.model.set({
			done : !checkboxstate
		})
		self.model.save()
		self.updatecheckboxel()
	},	
	updatecheckboxel : function() {
			var self = this
			_.bindAll(self)
			//var itemText = self.mode.get('text')
			//var itemTextel = self.$el.find('.text')
			var checkboxstate = self.model.get('done')
			var checkboxel = self.$el.find('.tickbox')
			checkboxel.html((checkboxstate) ? '&#10003;' : '&nbsp;' )
			self.$el.find('.text').css({'text-decoration' : checkboxstate ? 'line-through' : 'none'})

	},	
	showDeleteItem : function() {
			var self = this
			_.bindAll(self)
			self.$('.deleteButton').show();
	},	
	hideDeleteItem : function() {
			var self = this
			_.bindAll(self)
			self.$('.deleteButton').hide();
			
	},			
	deleteItem : function() {		
		var self = this
		self.model.destroy()
	}	
	
  }))
}

//------------------------------//
//-------THE INITIALIZERS-------//
//------------------------------//

app.init_browser = function() {
  if( browser.android ) {
    $("#main div[data-role='page']").css({
      bottom: 0
    })
  }
}
app.init = function() { //activate the app instance
  console.log('start init') //write to console when app start up begins
  bb.init() //activate the bb instance within
  app.init_browser() //activate the browswer.
  app.model.state = new bb.model.State() //create a new state for the bb instance
  app.model.items = new bb.model.Items() //create a new items container for the bb instance
  app.view.head = new bb.view.Head(app.model.items) //create a new header for the bb instance
  app.view.head.render() //display the new header
  app.view.list = new bb.view.List(app.model.items) ////create a new list for the bb instance
  app.view.list.render() //display the new list
  app.model.items.fetch( {
    success: function() { //if everything works so far....
      app.model.state.set({items:'loaded'}) //set the app state to loaded
      app.view.list.render() //display the view
    }
  })
  console.log('end init') ////write to console when the app start up process ends
}

//-----------------------------//
//-------Kick it all off-------//
//-----------------------------//

$(app.init) //run the app start up process