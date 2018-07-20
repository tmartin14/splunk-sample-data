import sys, os
from splunklib.searchcommands import \
    dispatch, GeneratingCommand, Configuration, Option, validators

import json, re
import urllib2
import requests

@Configuration()
# Command format is | loaddata data_type={"sourcetypes" or "samples"}
class loadDataCommand(GeneratingCommand):
    data_type  = Option(require=True,doc=''' **Syntax:** **data_type=***<fieldname>***Description:** What data would you like to retrieve? <sourcetypes | samples>''')
    #data_files = Option(require=True)
    #delete_existing_data = Option(require=True)
    

    def generate(self):              
        base_url     = "https://raw.githubusercontent.com/tmartin14/splunk-sample-data/master/"
        config_url   = base_url + "config/sourcetypes.json"
        data_url     = base_url + "data/"   

   
        if (self.data_type.upper() == "SOURCETYPES"):
            #Load App Index Data
            myindex = self.service.indexes["sampledata"]
 
            #insert a test file  - this works    ==> Need to read the file, create a new file and submit it.
            myindex.upload("/Users/tomm/dev/github/splunk-sample-data/config/sourcetypes.json", host="github", sourcetype="sampledata:sourcetypes")
 
            #   Get the list of Sample Files we have on github
            data_files = json.loads(urllib2.urlopen(config_url).read())
            for sourcetype, filename in data_files.iteritems():
                source_type = sourcetype
                file_url = data_url + filename

                #Insert each of th samples files   (we'll ultimately need too parse the list of files base on input)
                yield {'Status':"just kidding" + file_url}
                #myindex.upload(file_url, host="github", sourcetype=sourcetype)

            yield {'Status': "sourcetypes.json loaded into sampledata index (Search using:  index=sampledata sourcetype=sampledata:sourcetypes )"}


dispatch(loadDataCommand, sys.argv, sys.stdin, sys.stdout, __name__)

