(function(window, undefined){
	var formBuilder = {};
	
  formBuilder.Form = Backbone.Model.extend({
    defaults: {
    templateType : "formSection"
    },
    initialize : function (params){
      this.fields = new formBuilder.FieldsList();
      this.fields.parse(params.fields);
      this.templateFactory = templateFactory;
      this.template = this.templateFactory.getTemplate( this.get("templateType") );
    },
    render : function(){
      var fieldsHTML = [];
      this.fields.forEach( function(field){
        fieldsHTML.push( field.render() );
      } );
      this.set({ "fieldsHTML" : fieldsHTML });
      return ( this.template.render( this.toJSON() ) );
    }
  });
  
  formBuilder.FieldsList = Backbone.Collection.extend({
    parse: function(data){
      var self = this;
      data.forEach(function(item){
        self.add( new formBuilder[item.type](item) );
      } );
    }
  });
	
	formBuilder.Field = Backbone.Model.extend({
    defaults: {
			label : "Unassigned",
			name : "Unassigned",
			title : "Unassigned",
			value : "Unassigned",
			template : "formText",
			errorMessage : "This field contains an error."
    },
    initialize : function (){
      this.set({"selector":"input[name=\""+this.get("name")+"\"]"});
      this.set({ "errorMessageName":this.get("name") + "ErrorMessage"});
      this.set({"messageHtml": templateFactory.getTemplate("errorMessage").render( this.toJSON() ) });
		  this.reset();
      this.set({ "fieldHtml": this.render() });
    },
		setValue : function( value ){
			this.set({ "currentValue" : value });
			return (value);
		},
		render : function(){
			this.isValid();
			var objTemplate = templateFactory.getTemplate(this.get("template"));
			return( objTemplate.render( this.toJSON() ) );
		},
		showError : function(){
      if ( this.isValid() === false && $( 'label[for="'+this.get('name')+'"].error' ).length === 0  ){
				$('p[title="'+this.get('name')+'-error"]').append( this.get("messageHtml") );
			} else if ( this.isValid() === false && $( 'label[for="'+this.get('name')+'"].error' ).length !== 0 ){
				return(true);
			} else {
				$('label[for="'+this.get('name')+'"].error').remove() ;
			}
		},
		reset : function(){
			this.setValue( this.get("value") );
		},
		getValue : function(){
			var curVal = $(this.get("selector")).val();
			this.setValue( curVal );
			return( curVal );
		},
		isValid : function(){
			this.set({ "invalid" : false });
			if (this.requireValidate()){ this.set({ "invalid" : true }); return false; }
			if (this.minLengthValidate()){ this.set({ "invalid" : true }); return false; }
			if (this.maxLengthValidate()){ this.set({ "invalid" : true }); return false; }
			if (this.regexValidate()){ this.set({ "invalid" : true }); return false; }
			return true;
		},
		requireValidate : function(){
			if( this.get("required") ){
				return( this.get("currentValue") === false );
			}
			return false;
		},
		minLengthValidate : function(){
			if(this.get("minLength")){
				return( this.get("currentValue").length > this.get("minLength") );
			}
			return false;
		},
		maxLengthValidate : function(){
			if(this.get("maxLength")){
				return( this.get("currentValue").length < this.get("minLength") );
			}
			return false;
		},
		regexValidate : function(){
			if(this.get("regex")){
				var rexp = new RegExp( this.get("regex") );
				return( !this.get("currentValue").match(rexp) );
			}
			return false;
		}
	});
	
	formBuilder.TextField = formBuilder.Field.extend({
		defaults: {
			label : "Unassigned text label",
			name : "unassignedTextName",
			title : "Unassigned",
			value : "",
			"class" : "text",
			errorMessage : "This field contains an error.",
			template : "formText"
		}
	});
	
	formBuilder.SelectField = formBuilder.Field.extend({
		defaults: {
			label : "Unassigned select label",
			title : "Unassigned",
			name : "unassignedSelectName",
			value : "",
			options : [],
			"class" : "select",
			template : "formSelect"
		}
	});
	
	formBuilder.BooleanField = formBuilder.Field.extend({
		defaults: {
			label : "Unassigned boolean label",
			title : "Unassigned",
			name : "unassignedBooleanName",
			value : "",
			options : [{label: "Yes", value:1}, {label: "No", value:0}],
			"class" : "radio-list",
			errorMessage : "This field contains an error.",
			template : "formBoolean"
		},
	    initialize : function (){
        this.set({"selector":"input[name=\""+this.get("name")+"\"]:checked"});
        this.set({"messageHtml": templateFactory.getTemplate("errorMessage").render( this.toJSON() ) });
        this.reset();
        this.set({ "fieldHtml": this.render() });
	    },
		setValue : function( value ){
			this.set({ "currentValue" : value });
			var currentOptions = this.get("options");
			var updatedOptions = [];
			for ( var radio in currentOptions ){
				if( currentOptions[radio].value.toString() === value ){
					currentOptions[radio].checked = true;
				} else {
					currentOptions[radio].checked = false;
				}
				updatedOptions.push(currentOptions[radio]);
			}
			this.set({ "options" : updatedOptions });
			return (updatedOptions);
		}
	});
	
	formBuilder.CheckboxField = formBuilder.Field.extend({
		defaults: {
			label : "Unassigned checkbox label",
			title : "Unassigned",
			name : "unassignedCheckboxName",
			checked : false,
			value : "0",
			"class" : "checkbox",
			template : "formCheckbox"
		},
    initialize : function (){
      this.set({"selector":"input[name=\""+this.get("name")+"\"]"});
      this.set({"messageHtml": templateFactory.getTemplate("errorMessage").render( this.toJSON() ) });
      this.set({ "fieldHtml": this.render() });
      this.reset();
    },
		getValue : function(){
			var curVal = $(this.get("selector")).attr("checked");
			this.setValue( curVal );
			return( curVal );
		},
		setValue : function( value ){
			if ( (value === true) || (value === false)){
				this.set({ "checked" : value });
			}
			return (value);
		}
	});

	formBuilder.CheckboxListField = formBuilder.Field.extend({
		defaults: {
			label : "Unassigned checkbox list label",
			title : "Unassigned",
			name : "unassignedCheckboxListName",
			value : [],
			elements : [],
			"class" : "checkbox-list",
			template : "formCheckboxList"
		},
	    initialize : function (){
        this.set({"selector":function(name){return ("input[name=\""+name+"\"]");}});
        this.set({"messageHtml": templateFactory.getTemplate("errorMessage").render( this.toJSON() ) });
        this.set({ "fieldHtml": this.render() });
        this.reset();
	    },
		getValue : function(){
			var selectorFunc = this.get("selector");
			var currentOptions = this.get("elements");
			for ( var radio in currentOptions ){
				currentOptions[radio].checked = $( selectorFunc(currentOptions[radio].name) ).attr("checked");
			}
			this.setValue( currentOptions );
			return ( currentOptions );
		},
		reset : function(){
			this.setValue( this.get("elements") );
		},
		setValue : function( value ){
			if ( (value === true) || (value === false)){
				this.set({ "elements" : value });
				return (value);
			}
		}
	});
	
	formBuilder.RadioListField = formBuilder.Field.extend({
		defaults: {
			label : "Unassigned radio button list label",
			title : "Unassigned",
			name : "unassignedRadioListName",
			value : "",
			errorMessage : "This field contains an error.",
			elements : [],
			"class" : "radio-list",
			template : "formRadioList"
		},
	    initialize : function (){
        this.set({"selector":"input[name=\""+this.get("name")+"\"]:checked"});
        this.set({"messageHtml": templateFactory.getTemplate("errorMessage").render( this.toJSON() ) });
        this.set({ "fieldHtml": this.render() });
	    },
		setValue : function( value ){
			this.set({ "currentValue" : value });
			var currentOptions = this.get("elements");
			var updatedOptions = [];
			for ( var radio in currentOptions ){
				if( currentOptions[radio].value === value ){
					currentOptions[radio].checked = true;
				} else {
					currentOptions[radio].checked = false;
				}
				updatedOptions.push(currentOptions[radio]);
			}
			this.set({ "elements" : updatedOptions });
			return (updatedOptions);
		}
	});
	
	formBuilder.DateField = formBuilder.Field.extend({
	    defaults: {
			label : "Unassigned date label",
			name : "unassignedDateName",
			errorMessage : "This field must contain a valid date.",
			title : "Unassigned",
			value : "yyyy-mm-dd",
			template : "formDate",
			regex : /^\d{4}-\d{1,2}-\d{1,2}$/
	    }
	});
	
	formBuilder.DateRangeField = formBuilder.Field.extend({
		defaults: {
			label : "Unassigned date range label",
			title : "Unassigned",
			name : "unassignedDateRangeName",
			value : { fromDate : "" , toDate : "" },
			"class" : "daterange",
			template : "formDateRange"
		}
	});
	
	formBuilder.LocationField = formBuilder.Field.extend({
		defaults: {
			label : "Unassigned location label",
			title : "Unassigned",
			name : "unassignedLocationName",
			value : { city : "" , state : "" },
			"class" : "locationField",
			template : "formLocation",
			errorMessage : "This field contains an error."
		},
	    initialize : function (){
        this.set({"selector":"input[name=\""+this.get("name")+"\"]"});
        this.set({"messageHtml": templateFactory.getTemplate("errorMessage").render( this.toJSON() ) });
        this.set({options : _.keys(this.get("options")) });
        this.reset();
        this.set({ "fieldHtml": this.render() });
	    },
		requireValidate : function(){
			if( this.get("required") ){
				return( (this.get("value").city === false) && (this.get("value").state === false) );
			}
		}
	});
	
	formBuilder.PhoneField = formBuilder.Field.extend({
		defaults: {
			label : "Unassigned option label",
			title : "Unassigned",
			name : "unassignedPhoneName",
			errorMessage : "This field contains an error.",
			value : { num1 : "", num2 : "", num3 : "" },
			options : [],
			"class" : "phone",
			template : "formPhone"
		},
	  initialize : function (){
      this.set({"selector":function(name){return ("input[name=\""+name+"\"]");}});
	    this.set({"messageHtml": templateFactory.getTemplate("errorMessage").render( this.toJSON() ) });
	    this.set({ "fieldHtml": this.render() });
	  },
		getValue : function( num1, num2, num3 ){
      var selectorFunc = this.get("selector");
			var name = this.get("name");
			var value = {"num1":$(selectorFunc(name+"-phone-1")).val(),"num2":$(selectorFunc(name+"-phone-2")).val(),"num3":$(selectorFunc(name+"-phone-3")).val()};
			this.setValue(value.num1, value.num2, value.num3);
			return ({"num1":num1,"num2":num2,"num3":num3});
		},
		setValue : function( num1, num2, num3 ){
			var newValue = { "num1" : num1, "num2" : num2, "num3" : num3 };
			this.set({ "value": newValue });
			return ( { "num1":num1, "num2":num2, "num3":num3 } );
		},
		requireValidate : function(){
			if( this.get("required") ){
				var value = this.get("value");
				return( !((value.num1 !== "") && (value.num2 !== "") && (value.num3 !== "")) );
			}
		}
	});
  
  formBuilder.SectionHeader = Backbone.Model.extend({
    defaults: {
      name : "Title",
      templateType : "SectionHeader"
    },
    initialize : function (){
      this.template = templateFactory.getTemplate( this.get("templateType") );
    },
    render : function(){
      return ( this.template.render( this.toJSON() ) );
    }
  });
	
	window.formBuilder = formBuilder;
})(window);