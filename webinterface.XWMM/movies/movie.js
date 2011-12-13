// -----------------------------------------
// movie.js
//------------------------------------------ 

Ext.ns('Movie');

var Stars = new Ext.Container ({
	id: 'movierating',
	border: 0,
	width: 96,
	height:27,
	autoEl: {tag: 'img', src: "../images/stars/0.png"},
	updateSrc :function(r){
		if (r.data.details)	{
			this.el.dom.src = r.data.ratingstars
		}
		else {
			var value = Math.round(r.data.MovieRating);
			r.data.ratingstars =  '../images/stars/'+value+'.png';
			this.el.dom.src = r.data.ratingstars;
		}
	}
});

var MovieFanart = new Ext.Container ({
	id: 'fanart',
	border: 0,
	width: 295,
	height:165,
	autoEl: {tag: 'img', src: "../images/defaultMovieFanart.jpg", qtip:'Double-click to change'},
		refreshMe : function(){
		this.el.dom.src =  this.el.dom.src + '?dc=' + new Date().getTime();
	},
	updateSrc :function(r){
		if (r.data.details)	{
			this.el.dom.src = '../../vfs/'+r.data.fanart
		}
		else {	
			var file = r.data.strFilename;
			var path = r.data.strPath;
			if (file.substr(0,6) == 'stack:'){	//it is a stack
				file = file.replace(/stack:\/\//g, "");
				var tempArr = file.split(" , ");
				file = tempArr[0];
				path=""
			}
			thumbCrc = FindCRC(path+file);
			r.data.fanart = 'special://masterprofile/Thumbnails/Video/Fanart/'+thumbCrc+'.tbn';
			this.el.dom.src = '../../vfs/'+ r.data.fanart;
		}
	}
});

var MovieCover = new Ext.Container ({
	id: 'cover',
	cls: 'center-align',
	border: 0,
	width: 250,
	height:375,
	autoEl: {tag: 'img', src: "../images/defaultMovieCover.jpg", qtip:'Double-click to change'},
	refreshMe : function(){
		this.el.dom.src =  this.el.dom.src + '?dc=' + new Date().getTime();
	},
	updateSrc :function(r){
		if (r.data.details)	{
			this.el.dom.src = '../../vfs/'+r.data.cover
		}
		else {	
			var file = r.data.strFilename;
			var path = r.data.strPath;
			if (file.substr(0,6) == 'stack:'){	//it is a stack
				file = file.replace(/stack:\/\//g, "");
				var tempArr = file.split(" , ");
				file = tempArr[0];
				path=""
			}
			thumbCrc = FindCRC(path+file);
			r.data.cover = 'special://masterprofile/Thumbnails/Video/'+thumbCrc.substring(0,1)+'/'+thumbCrc+'.tbn';
			this.el.dom.src = '../../vfs/'+ r.data.cover;
			// copyXBMCVideoThumb(thumbCrc, r, this);
		}
	}

});

var fileDetailsPanel = new Ext.FormPanel({
	id: 'filedetailPanel',
	title: 'Other details',
	labelWidth:50,
	frame: true,
	bodyStyle:'padding:5px',
	defaults: {width: 140, xtype: 'textfield'},
	items: [{
		fieldLabel: 'Name',
		name: 'strFilename',
		readOnly: true,
		XBMCName: 'c00'
	},{
		fieldLabel: 'Directory',
		name: 'strPath',
		readOnly: true,
		XBMCName: 'c05'
	},{
		xtype: 'combo',
		fieldLabel: 'Set',
		emptyText : '-- None --',
		store: MovieSetStore,
		displayField: 'strSet',
		id: 'moviesetcombo',
		mode: 'local',
		triggerAction: 'all',
		name: 'strSet',
		listeners: {
			change: function(combo, newValue, oldValue) {
				var currentMovie = Moviegrid.getSelectionModel().getSelected();
				if (newValue == "") {
					// remove existing record in setlinkmovie
					myId = "";
					var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(DELETE FROM setlinkmovie WHERE idMovie = "'+currentMovie.data.idMovie+'"))';
				}
				else {
					var myId = MovieSetStore.getAt(MovieSetStore.findExact('strSet', newValue)).data.idSet;
					if (newValue != oldValue) {
						if (oldValue == "") {
							// Add new record in setlinkmovie
							var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(INSERT INTO setlinkmovie (idSet, idMovie) VALUES ('+myId+','+currentMovie.data.idMovie+'))';				
						}
						else {
							// modify existing record in setlinkmovie
							var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(INSERT INTO setlinkmovie (idSet, idMovie) VALUES ("'+record.data.idMovie+'"))';
						}

					}
				}
				XBMCExecSql(inputUrl);
				currentMovie.data.idSet = myId;
				currentMovie.data.strSet = newValue;
				Moviegrid.getView().refresh();
			}
		}
	}]
})

var MoviedetailPanel = new Ext.FormPanel({
	width: 600,
	region: 'center',
	id: 'MoviedetailPanel',
	trackResetOnLoad : true,
	title: "<div align='center'>Movie details</div>",
	defaults:{hideLabels:true, border:false},
	buttons: [{
		disabled: true,
		text:'Save',
		id: 'savebutton',
		handler: function(){	
			updateXBMCAll();
			this.disable();
		}
	},{
		text:'Cancel',
		handler: function(){
			updateGenreGrid(currentRecord.data.genres)
		}
	}],    
	
	layout:'table',
	layoutConfig: {columns:3},
	defaults: {frame:true, width:220, height: 120, labelWidth: 60},
	items:[{
		width: 300,
		height : 90,
		layout: 'form',
		defaults: {	xtype:'textfield',
			width: 220,
			listeners:{change : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}
		},
		items: [{
			fieldLabel: 'Title',
			name: 'Movietitle',
			XBMCName: 'c00',
			allowBlank: false
		},{
			fieldLabel: 'Sort Title',
			name: 'sortTitle',
			XBMCName: 'c10'

		},{
			fieldLabel: 'Genres',
			name: 'Moviegenres',
			XBMCName: 'c14',
			id:'moviegenres',
			readOnly: true

		}]
	},{	
		layout: 'form',
		width:160,
		height: 90,
		defaults: {	xtype:'textfield',
			width: 80,
			listeners:{change : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}
		},
		labelWidth: 60,
		items:[{
			fieldLabel: 'Release',
			XBMCName: 'c07',
			name: 'MovieRelease'
		},{	
			fieldLabel: 'Rating',
			name: 'MovieRating',
			XBMCName: 'c05'
		},{
			fieldLabel: 'Duration',
			XBMCName: 'c11',
			name: 'MovieRuntime'
		}]
	},{
		rowspan:2,
		width:255,
		height: 410,
		items: [Stars, MovieCover]
	},{
		layout : 'form',
		width: 460,
		height: 320,
        colspan:2,
		defaults: {	xtype:'textfield', 
			width: 370,
			listeners:{change : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}
		},
		items: [{
			xtype:'textarea',
			name:'Moviedescr',
			XBMCName: 'c01',
			fieldLabel:'Description',
			height: 95
		},{
			xtype:'textarea',
			height: 34,
			name:'MovieOutline',
			XBMCName: 'c02',
			fieldLabel:'Abstract'
		},{
			xtype:'textarea',
			name:'MovieTagline',
			XBMCName: 'c03',
			fieldLabel:'Tag Line',
			height: 34
		},{	
			fieldLabel: 'Director',
			XBMCName: 'c15',
			name: 'MovieDirector'
		},{
			fieldLabel: 'Viewers',
			XBMCName: 'c12',
			name: 'MovieViewers'
		},{
			fieldLabel: 'Studio',
			XBMCName: 'c18',
			name: 'MovieStudio'
		},{	
			fieldLabel: 'Trailer',
			id: 'trailer',
			XBMCName: 'c19',
			name: 'MovieTrailer'
		},{
			xtype: 'button',
			text: 'View Trailer',
			handler: function(){
				if (Ext.getCmp('trailer').getValue() != '') {
				//var w = (window.open(urlstring, wname, wfeatures, false));
						window.open(Ext.getCmp('trailer').getValue(),'')
				}
			},
			width: 60
		}]
	},{
		frame : false,
		width: 300,
		height: 120,
		items: [MovieFanart]
	},{
		width: 160,
		//frame : false,
		items: [AudioFlagsPanel]
		// height : 200
	},{
		width : 255,
		//frame : false,
		items: [VideoFlagsPanel]
		// heigth :
	}]
})

//Main Panel
Movie.Mainpanel = Ext.extend(Ext.Panel, {
	initComponent: function() {
		Ext.applyIf(this, {
		frame: true,
		title: 'Movies List',
		width: 1250,
		height: 700,
		loadMask: true,
		layout: 'border',
		renderTo: Ext.getBody(),
		items: [{		
			xtype: 'panel',
			region:'east',
			//margins:'5 5 5 5',
			split:true,
			width: 225,
			items: [{
				layout:'accordion',
				height: 500,
				items:[
					Genregrid,
					actorGrid,
					fileDetailsPanel
				]
			}]	
		},
			menuBar,
			Moviegrid,
			MoviedetailPanel
		]
		})
			
		Movie.Mainpanel.superclass.initComponent.call(this);
	},
	
	initEvents: function() {
		Movie.Mainpanel.superclass.initEvents.call(this);
		var currentMovie = this.getComponent('Moviegrid').getSelectionModel();
		
		currentMovie.on('rowselect', this.onRowSelect, this);
		
		// add double-click event to cover object
		var element = MovieCover.getEl();
		element.on('dblclick', function(){ChangeImages(currentRecord)});
		
		var element2 = MovieFanart.getEl();
		element2.on('dblclick', function(){ChangeImages(currentRecord)});
	},

	onRowSelect: function(sm, rowIdx, r) {
		
		selectedMovie = r.data.idMovie;
		currentRecord = r;
		storeActor.proxy.conn.url = "/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT strActor, strRole FROM actorlinkmovie JOIN actors ON (actorlinkmovie.idActor = actors.idActor) where idMovie ="+r.data.idMovie+")";

		
		if (r.data.details == undefined){
			GetMovieGenres(r);
			GetMovieDetails(r);
			storeActor.load();
			//storeActor.load({params: {id: r.data.idMovie}});
			Ext.getCmp('filedetailPanel').getForm().loadRecord(r);
		}
		else{ 
			updateGenreGrid(r.data.genres);
			storeActor.load();
			updateAllForms(r)
		};
		
		
	}
});
Ext.reg('Mainpanel', Movie.Mainpanel);
