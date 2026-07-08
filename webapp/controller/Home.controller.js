sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/comp/filterbar/FilterBar",
    "sap/ui/comp/filterbar/FilterGroupItem"
], (Controller, MessageToast, Fragment,  ValueHelpDialog,
        FilterBar,
        FilterGroupItem ) => {
    "use strict";

    return Controller.extend("gvtracker.controller.Home", {
        
        onModeChange() {

                  var bCreateSelected =
                    this.byId("rbCreate").getSelected();
          

                var bDisplaySelected =
                    this.byId("rbDisplay").getSelected();

                  

               this.byId("lblGVR").setVisible(true);
                this.byId("inputGVR").setVisible(true);

                if (bCreateSelected) {

                    this.byId("inputGVR").setEditable(false);
                    this.byId("inputGVR").setShowValueHelp(false);
                    this.byId("inputGVR").setValue("");

                    // Temporary value
                  

                } else if (bDisplaySelected) {

                    this.byId("inputGVR").setEditable(true);
                    this.byId("inputGVR").setShowValueHelp(true);

                    this.byId("inputGVR").setValue("");
                }

            },

       onExecute() {

            var bCreateSelected =
                this.byId("rbCreate").getSelected();
            var bDisplaySelected =
                this.byId("rbDisplay").getSelected();

            if (bCreateSelected) {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteCreate");

            } else if (bDisplaySelected) {
                var sGvrNo =
                this.byId("inputGVR").getValue();

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteDisplay", {
                        gvrNo: sGvrNo
                    });

            }


        },
       onValueHelpRequest: function () {

            if (!this._oGVRVHD) {

                var oFilterBar = new FilterBar({

                    search: function () {

                        var oTable =
                            this._oGVRVHD.getTable();

                        if (oTable) {
                            oTable.getBinding("rows").refresh();
                        }

                    }.bind(this)

                });

                oFilterBar.addFilterGroupItem(

                    new FilterGroupItem({

                        groupName: "__BASIC",

                        name: "gv_no",

                        label: "GVR Number",

                        control: new sap.m.Input()

                    })

                );

                oFilterBar.addFilterGroupItem(

                    new FilterGroupItem({

                        groupName: "__BASIC",

                        name: "campaign_name",

                        label: "Campaign",

                        control: new sap.m.Input()

                    })

                );

                this._oGVRVHD = new ValueHelpDialog({

                    title: "Select GVR Number",

                    supportMultiselect: false,

                    supportRanges: true,

                    key: "gv_no",

                    descriptionKey: "campaign_name",

                    filterBar: oFilterBar,

                    ok: function (oEvent) {

                        var aTokens =
                            oEvent.getParameter("tokens");

                        if (aTokens.length > 0) {

                            this.byId("inputGVR")
                                .setValue(aTokens[0].getKey());
                        }

                        this._oGVRVHD.close();

                    }.bind(this),

                    cancel: function () {

                        this._oGVRVHD.close();

                    }.bind(this)

                });

                this.getView()
                    .addDependent(this._oGVRVHD);

                this._oGVRVHD.getTableAsync()
                    .then(function (oTable) {

                        if (oTable.bindRows) {

                            oTable.addColumn(
                                new sap.ui.table.Column({
                                    label: "GVR Number",
                                    template: "gv_no"
                                })
                            );

                            oTable.addColumn(
                                new sap.ui.table.Column({
                                    label: "Campaign",
                                    template: "campaign_name"
                                })
                            );

                            oTable.setModel(
                                this.getView().getModel()
                            );

                            oTable.bindRows("/GVHeaderSet");
                        }

                        this._oGVRVHD.update();

                    }.bind(this));
            }

            this._oGVRVHD.open();
        },
        onConfirmGVR(oEvent) {

            var oItem = oEvent.getParameter("selectedItem");

            if (oItem) {

                this.byId("inputGVR")
                    .setValue(oItem.getTitle());

            }
        }
    });
});