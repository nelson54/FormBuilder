formSettings = {
	options : {
		colors: ["Red", "Green", "Purple", "Yellow"],
		states: {none:"", mi: "Michigan", oh: "Ohio"}
	},
	fields : [
	    {
	    	name: "firstName",
	        label: "First Name",
	        type: "TextField",
	        length: 32,
	        required: true,
	        error: "string",
	        show: true
	    },
	    {
	    	name: "lastName",
	    	label: "Last Name",
	        type: "TextField",
	        length: 32,
	        required: true,
	        error: "string",
	        show: true
	    },
	    {
	    	name: "birthdate",
	        type: "DateField",
	        label: "Birth Date",
	        value: "",
	        required: true,
	        error: "string",
	        show: true
	    },
	    {
	    	name: "birthPlace",
	    	type: "LocationField",
	    	label: "Birth Place",
	    	value: "",
	    	length: 256,
	    	required: true,
	    	error: "string",
	    	options: [],
	    	show: true
	    },
	    {
	    	name: "gender",
	    	type: "BooleanField",
	    	label: "Gender",
	        options: [{label: "Male", value:"1"}, {label: "Female", value:"0"}],
	        length: 1,
	        required: true,
	        error: "string",
	        show: true
	    },
	    {
	    	name: "language",
	    	type: "TextField",
	    	label: "Native Language",
	    	name: "language",
	    	value: "",
	    	length: 256,
	    	required: true,
	    	error: "string",
	    	show: true
	    }
	]
};