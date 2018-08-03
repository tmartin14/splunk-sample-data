//
//  Known Issue:   If the sample file has large amounts of data, the insert is likely to fail (the browser will run out of memory)
//  Looks like <5,000 lines is fine.
//


//var base_url = "https://raw.githubusercontent.com/tmartin14/splunk-sample-data/master/";
var base_url = "https://raw.githubusercontent.com/splunk/Essentials_Demo_Data/master/";
var splunkWebHttp = new splunkjs.SplunkWebHttp();
var service = new splunkjs.Service(splunkWebHttp);
var indexes = service.indexes();

var payload;
var sourcetype_items;

//   variables to ensure synchronous processing of function calls
var urlComplete = $.Deferred();
var insertComplete = $.Deferred();
var execSearchComplete = $.Deferred();

// retrieve all available sample sourcetypes
queryAJAX(base_url + "config/sourcetypes.json");
loadRepo();

//-------------------------------------------------------------------------------------
//   Create the UI elements of the dashboard  (dropdown, insert button, delete button)
//-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //    Create a textbox where a user can specify their own Sample Data Repository
    //-------------------------------------------------------------------------------------
    $("#repoText").html($('<label for="repo">If you have your own sample data repo, enter it here:</label><textarea id="repo" name="repo" rows="1" style="margin: 0px; width:600px; height: 30px; resize: both;">' + base_url + "</textarea>" ));
    $("#button_repo").html($("<button class=\"btn btn-primary\">Update</button>").click(function() {
            base_url = $("#repo").val();
            var urlComplete = $.Deferred();
            loadRepo();
            //alert(base_url);
    }));


    //-------------------------------------------------------------------------------------
    //    Add buttons to the page 
    //-------------------------------------------------------------------------------------
    //  DELETE Button
    $("#button_delete").html($("<button class=\"btn btn-primary\">Delete Data</button>").click(function() {
        var st = $("#sourcetypes").find(':selected').text();
        execSearch("index=sampledata sourcetype=\"" + st + "\"" + " | delete");
        setStatus("<b>" +st + "</b> data deleted.")
        console.log("DELETE:  Deleted " + st + " data.");
    }))

    //  INSERT Button
    $("#button_insert").html($("<button class=\"btn btn-primary\">Insert Data</button>").click(function() {
        // setup the deferral so that the URL retreival completes BEFORE inserting the data
        urlComplete = $.Deferred();
        insertComplete = $.Deferred();
        
        // which sourcetype do we need?
        var st = $("#sourcetypes").find(':selected').text();

        // go get the sample data
        setStatus("Retrieving <b>" + st + "</b> data...")
        queryAJAX(base_url + "data/" + getSampleFilename(st));
        $.when(urlComplete).then(function(){
            setStatus("Inserting <b>" + st + "</b> data.  Please be patient...")
            // insert the data into our index
            insertData("sampledata", payload, st);
            $.when(insertComplete).then(function(){
                console.log("INSERT:  Added " + st + " data.");
                // now refresh the table
                execSearch("index=sampledata sourcetype=\"" + st + "\"" + " | table sourcetype _time _raw | head 100");  
            })
        })

    }))

    //  Summary Button - Show what sourcetypes are already loaded
    $("#button_summary").html($("<button class=\"btn btn-primary\">What's Loaded</button>").click(function() {
        execSearch('| tstats values(sourcetype) as "sourcetype" where index=sampledata | mvexpand "sourcetype"');
        setStatus("running search...")
    }))

    // SEARCH button
    $("#button_search").html($("<button class=\"btn btn-primary\">Search</button>").click(function() {
        var spl = $("#spl").val();
        execSearch(spl);
        setStatus("running search...")
    }))

    //-------------------------------------------------------------------------------------
    //    Add status component - sometimes an insert can take a looooooong time...
    //-------------------------------------------------------------------------------------
    function setStatus(msg){
        $("#status").html($("<p>" + msg + "</p>"));
    }

    //-------------------------------------------------------------------------------------
    //    Add searchText component to enable random searches from this page
    //-------------------------------------------------------------------------------------
    function setSearchText(spl){
        $("#searchText").html($('<label for="spl">Or just enter a search below</label><textarea id="spl" name="spl" rows="1" style="margin: 0px; width:700px; height: 30px; resize: both;">' + spl + "</textarea>"));
    }

    setSearchText("index=sampledata | head 100");





//-------------------------------------------------------------------------------------
//    Load a sample data repo
//-------------------------------------------------------------------------------------
function loadRepo() {
    $.when(urlComplete).then(function(){
        var options = '';
        items = JSON.parse(sourcetype_items);
        for (var i = 0; i < items.length; i++) {
            options += '<option value="' + items[i].sample_filename + '">' + items[i].data_sourcetype + '</option>';
        }
        $("#sourcetypes").html($('<select id="st"><option value="" disabled="disabled" selected="selected">Please select...</option>' +  options + '</select>'));

        $("#sourcetypes").change(function(event){
            var st = $(event.target).find(':selected').text()
            execSearch( "index=sampledata sourcetype=\"" + st + "\"" + " | table sourcetype _time _raw | head 100");
            setStatus(" ")

        })
        execSearch('| tstats values(sourcetype) as "sourcetype" where index=sampledata | mvexpand "sourcetype"');
    })
}





//-------------------------------------------------------------------------------------
//    Execute a URL and load the results into the "payload" variable
//-------------------------------------------------------------------------------------
function queryAJAX(myUrl) {
    console.log("QUERY: Getting data from " + myUrl + "...")

    $.ajax({
        type: "GET",
        url: myUrl,
        success: function(data) {
            // save the data outside of this function
            payload = data;  
            // if we're retriving sourcetypes, then save those separately.  We'll use that array to determine parsing on inserts
            if(myUrl.indexOf("config/sourcetypes.json") !== -1){
                sourcetype_items = data;
            }
            urlComplete.resolve();
        },
        error: function(xhr, textStatus, error) {
            console.error("Error!", error);
            $("#result").html("<p><span style=\"color: red; font-weight: bolder;\">ERROR!  " + error  +"</span> <br/>Error retrieving data for <a target=_blank href='" + myUrl + "'>" + myUrl +"</a> <br/><br/>Check out the error in the Javascript Console for more details.</p>")
        }
    });
}




//-------------------------------------------------------------------------------------
//    Execute an SPL Search in the table on the dashboard
//-------------------------------------------------------------------------------------
function execSearch(spl){
    console.log("EXEC:  " + spl);
    var mySearch = splunkjs.mvc.Components.getInstance("mySearch");
    mySearch.cancel();
    mySearch.settings.unset("search");
    mySearch.settings.set("search",spl);
    mySearch.startSearch(); 

    // Display the number of rows that were retrieved.
    var myResults = mySearch.data('results', { // get the data from that search
         output_mode: 'json_rows',
         count: 0 // get all results
    });
    // When data arrives:
    myResults.on("data", function() {
        console.log(myResults.data().rows.length);
        setStatus( myResults.data().rows.length + " events retrieved.");
    });
    setSearchText(spl);
    execSearchComplete.resolve();
}


//-------------------------------------------------------------------------------------
//    Get the number of rows in the table
//-------------------------------------------------------------------------------------
function getRowCount(){
    var mySearch = splunkjs.mvc.Components.getInstance("mySearch"); // get the search manager
         var myResults = mySearch.data('results', { // get the data from that search
             output_mode: 'json_rows',
             count: 0 // get all results
         });
         // When data arrives:
         myResults.on("data", function() {
             console.log(myResults.data().rows.length);
         });
}


//-------------------------------------------------------------------------------------
//    Insert data into an index in Splunk
//-------------------------------------------------------------------------------------
function insertData(indexName, data, sourcetypeName){
    // first get the index to use 
    indexes.fetch(function(err, indexes){
        var myIndex = indexes.item(indexName);
        if (myIndex) {
            console.log("INSERT:  Found " + myIndex.name + " index");
        }else{
            console.log("INSERT:  Error!  Could not find index named " + indexName);
            return null;
        }

        //-------------------------------------------------------
        // Now loop through the data and insert each row or record
        //-------------------------------------------------------
        var emptyLines = 0;
        var parse_method = "line";  // default
        parse_method = getParseMethod(sourcetypeName);
        switch (parse_method) {
            case "array":
                console.log("INSERT:  parsing as array");
                var items = JSON.parse(data)
                for (var i = 0; i < items.length; i++) {
                    // Submit an event to the index
                    myIndex.submitEvent(items[i], { host: "github_import",sourcetype: sourcetypeName }, 
                        function(err, result, myIndex) {
                            //console.log("INSERT:  Submitted event: ", result);
                        });
                }
                break;
            default:
                console.log("INSERT:  parsing as line");
                fileLines = data.split("\n")
                for (var i = 0; i < fileLines.length; ++i) {
                    if(fileLines[i].length > 0){
                        // Submit an event to the index
                        myIndex.submitEvent(fileLines[i], { host: "github_import", sourcetype: sourcetypeName }, 
                            function(err, result, myIndex) {
                                console.log("INSERT:  Submitted event #: ", i);
                            });
                    }else{
                        emptyLines++;
                    }
                }
        } 
        insertComplete.resolve();
        setStatus("Inserted events for <b>" + sourcetypeName +"</b>. Refreshing index & running search. Please stand by...");    
    });
}

//-------------------------------------------------------------------------------------
//    Find the parsing method to use for a given sourcetype
//-------------------------------------------------------------------------------------
function getParseMethod(sourcetypeName){
    items = JSON.parse(sourcetype_items);
    for (var i = 0; i < items.length; i++) {
        if(sourcetypeName == items[i].data_sourcetype){
            console.log("PARSE:  pasrsing_method=" + items[i].parse_method + " for " + sourcetypeName);
            return items[i].parse_method;
        }
    }
}

//-------------------------------------------------------------------------------------
//    Find the data filename to use for a given sourcetype
//-------------------------------------------------------------------------------------
function getSampleFilename(sourcetypeName){
    items = JSON.parse(sourcetype_items);
    for (var i = 0; i < items.length; i++) {
        if(sourcetypeName == items[i].data_sourcetype){
            console.log("FILENAME: sample_filename=" + items[i].sample_filename + " for " + sourcetypeName);
            return items[i].sample_filename;
        }
    }
}





/*
//-------------------------------------------------------------------------------------
//    Just some left overs from testing ;-).  
//-------------------------------------------------------------------------------------

        $("#setButton").append($("<button class=\"btn btn-primary\">Set Search</button>").click(function() {
        var mySearch = splunkjs.mvc.Components.getInstance("mySearch");
        mySearch.cancel();
        mySearch.settings.unset("search");
        mySearch.settings.set("search","search index=sampledata");
        mySearch.startSearch();
    }))


 //$("#sourcetypes").change(function(event){console.log($(event.target).val())})
 
// random testing urls
https://raw.githubusercontent.com/tmartin14/splunk-sample-data/master/config/sourcetypes.json
https://raw.githubusercontent.com/tmartin14/splunk-sample-data/master/data/dynatrace.entity.json
https://s3.amazonaws.com/sa-jsforall-ratings/ratings.json
*/
