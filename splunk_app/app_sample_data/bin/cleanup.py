import sys
from splunklib.searchcommands import dispatch, GeneratingCommand, Configuration, Option, validators

@Configuration()

# Command format is | setup runas={ID} runaspw={password} userspw={password}

class setupCommand(GeneratingCommand):
    
    def generate(self):

        # Get Global Object Prefix from esm.conf
        
        conf = self.service.confs["esm"]
        for stanza in conf:
            if stanza.name == 'esmsettings':
                for key, value in stanza.content.iteritems():
                    if key == 'prefix':
                        globalobjectprefix = value

        # Delete Indexes
        
        idx = self.service.indexes.delete(globalobjectprefix+'app')
        yield {'Status': globalobjectprefix+'app Index Deleted'}
        idx = self.service.indexes.delete(globalobjectprefix+'infra')
        yield {'Status': globalobjectprefix+'infra Index Deleted'}
        idx = self.service.indexes.delete(globalobjectprefix+'secure')
        yield {'Status': globalobjectprefix+'secure Index Deleted'}
                
        #Delete Users
        
        user = self.service.users.delete(globalobjectprefix+'admin')
        yield {'Status': globalobjectprefix+'admin User Deleted'}
        user = self.service.users.delete(globalobjectprefix+'casual')
        yield {'Status': globalobjectprefix+'casual User Deleted'}
        user = self.service.users.delete(globalobjectprefix+'power')
        yield {'Status': globalobjectprefix+'power User Deleted'}
        user = self.service.users.delete(globalobjectprefix+'single_service')
        yield {'Status': globalobjectprefix+'single_service User Deleted'}
        user = self.service.users.delete(globalobjectprefix+'service_group')
        yield {'Status': globalobjectprefix+'service_group User Deleted'}
        user = self.service.users.delete(globalobjectprefix+'service_groups')
        yield {'Status': globalobjectprefix+'service_groups User Deleted'}
        user = self.service.users.delete(globalobjectprefix+'service_client')
        yield {'Status': globalobjectprefix+'service_client User Deleted'}
        user = self.service.users.delete(globalobjectprefix+'single_infra_component')
        yield {'Status': globalobjectprefix+'single_infra_component User Deleted'}
        user = self.service.users.delete(globalobjectprefix+'single_infra_component_subset')
        yield {'Status': globalobjectprefix+'single_infra_component_subset User Deleted'}
        user = self.service.users.delete(globalobjectprefix+'infra_components')
        yield {'Status': globalobjectprefix+'infra_components User Deleted'}
        user = self.service.users.delete(globalobjectprefix+'secure')
        yield {'Status': globalobjectprefix+'secure User Deleted'}
        user = self.service.users.delete(globalobjectprefix+'secure_special')
        yield {'Status': globalobjectprefix+'secure_special User Deleted'}
        user = self.service.users.delete(globalobjectprefix+'secure_special_subset')
        yield {'Status': globalobjectprefix+'secure_special_subset User Deleted'}
        
        #Delete Roles
        
        role = self.service.roles.delete('ig.i=all')
        yield {'Status': 'ig.i=all Role Deleted'}
        role = self.service.roles.delete('ig.i='+globalobjectprefix+'app.r=n')
        yield {'Status': 'ig.i='+globalobjectprefix+'app.r=n Role Deleted'}
        role = self.service.roles.delete('ig.i='+globalobjectprefix+'infra.r=n')
        yield {'Status': 'ig.i='+globalobjectprefix+'infra.r=n Role Deleted'}
        role = self.service.roles.delete('ig.i='+globalobjectprefix+'secure.r=n')
        yield {'Status': 'ig.i='+globalobjectprefix+'secure.r=n Role Deleted'}
        role = self.service.roles.delete('eg.i='+globalobjectprefix+'infra.r=y.t=web')
        yield {'Status': 'eg.i='+globalobjectprefix+'infra.r=y.t=web Role Deleted'}
        role = self.service.roles.delete('eg.i='+globalobjectprefix+'infra.r=y.t=db')
        yield {'Status': 'eg.i='+globalobjectprefix+'infra.r=y.t=db Role Deleted'}
        role = self.service.roles.delete('eg.r=y.pc=parentcluster1.c=cluster12')
        yield {'Status': 'eg.r=y.pc=parentcluster1.c=cluster12 Role Deleted'}
        role = self.service.roles.delete('eg.r=y.pc=parentcluster2')
        yield {'Status': 'eg.r=y.pc=parentcluster2 Role Deleted'}
        role = self.service.roles.delete('eg.r=y.pc=parentcluster1.c=cluster11')
        yield {'Status': 'eg.r=y.pc=parentcluster1.c=cluster11 Role Deleted'}
        role = self.service.roles.delete('eg.i='+globalobjectprefix+'app.r=y.t=myapp_myclient1')
        yield {'Status': 'eg.i='+globalobjectprefix+'app.r=y.t=myapp_myclient1 Role Deleted'}
        role = self.service.roles.delete('eg.i='+globalobjectprefix+'secure.r=n.t=proxy,bu1')
        yield {'Status': 'eg.i='+globalobjectprefix+'secure.r=n.t=proxy,bu1 Role Deleted'}
        role = self.service.roles.delete('eg.r=y.pc=parentcluster1')
        yield {'Status': 'eg.r=y.pc=parentcluster1 Role Deleted'}
        role = self.service.roles.delete('eg.i='+globalobjectprefix+'infra.r=y.t=web-apache')
        yield {'Status': 'eg.i='+globalobjectprefix+'infra.r=y.t=web-apache Role Deleted'}
        role = self.service.roles.delete('ig.i=_internal')
        yield {'Status': 'ig.i=_internal Role Deleted'}
        role = self.service.roles.delete('eg.i='+globalobjectprefix+'secure.r=y')
        yield {'Status': 'eg.i='+globalobjectprefix+'secure.r=y Role Deleted'}
                
dispatch(setupCommand, sys.argv, sys.stdin, sys.stdout, __name__)

