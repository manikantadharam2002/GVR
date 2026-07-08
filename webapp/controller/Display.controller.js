sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"   
    


], (Controller, History, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("gvtracker.controller.Display", {

        onInit() {
                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("RouteDisplay")
                    .attachPatternMatched(this._onRouteMatched, this);

               
                 var oModel = this.getOwnerComponent().getModel();

                    oModel.read("/GVHeaderSet", {

                        success: function (oData) {

                            var oGVRModel =
                                new sap.ui.model.json.JSONModel({
                                    results: oData.results
                                });

                            this.getView().setModel(
                                oGVRModel,
                                "gvr"
                            );

                        }.bind(this),

                        error: function (oError) {

                            console.log(oError);

                        }

                    });            


        },
            _onRouteMatched(oEvent) {

                var sGvrNo =
                    oEvent.getParameter("arguments").gvrNo;

                console.log("Selected GVR:", sGvrNo);

                var oModel =
                    this.getView().getModel();

                var that = this;

                oModel.read("/GVHeaderSet", {
                    urlParameters: {
                        "$expand": "customer,shoppingMall,cust_type,assignGiftVouchers/giftVoucher"
                    },

                    filters: [
                        new Filter(
                            "gv_no",
                            FilterOperator.EQ,
                            sGvrNo
                        )
                    ],

                    success: function(oData) {
                          console.log("SUCCESS CALLED");
                        

                       if (oData.results.length > 0) {

                            var oHeader = oData.results[0];

                            var oSelectedModel =
                                new sap.ui.model.json.JSONModel(oHeader);

                            that.getView().setModel(
                                oSelectedModel,
                                "selectedGVR"
                            );

                           console.log("Full Header:", oHeader);
                            console.log("AssignGiftVouchers:", oHeader.assignGiftVouchers);
                           console.log(
                                    "Gift Voucher Data:",
                                    oHeader.assignGiftVouchers.results[0].giftVoucher
                                );

                            console.log(
                                JSON.stringify(
                                    oHeader.assignGiftVouchers.results[0].giftVoucher,
                                    null,
                                    2
                                )
                            );
                                

                            // ✅ After
                           var oCreatedDate =
                                    oHeader.createdAt ?
                                    sap.ui.core.format.DateFormat
                                        .getDateInstance({
                                            pattern: "dd/MM/yyyy"
                                        })
                                        .format(new Date(oHeader.createdAt))
                                    : "";

                                oSelectedModel.setProperty(
                                    "/formattedDate",
                                    oCreatedDate
                                );

                            // Table Binding
                               // Table Binding

                                var oGiftModel =
                                    new sap.ui.model.json.JSONModel({
                                        items: oHeader.assignGiftVouchers.results
                                    });

                                that.getView().setModel(
                                    oGiftModel,
                                    "gift"
                                );                        }

                    },

                    error: function(oError) {

                        console.log(oError);

                    }

                });

            },
            onModeChange: function (oEvent) {

                var sKey =
                    oEvent.getParameter("item").getKey();

                console.log("Selected Tab:", sKey);

                var sGvrNo =
                    this.getView()
                        .getModel("selectedGVR")
                        .getProperty("/gv_no");

                console.log("Current GVR:", sGvrNo);

                if (sKey === "Create") {

                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("RouteDisplay", {
                            gvrNo: sGvrNo
                        });

                }

            },
            onBack: function () {
                this.getOwnerComponent().getRouter().navTo("RouteHome");

               
            },
            onGVRSelect: function (oEvent) {

                var sGvrNo =
                    oEvent.getParameter("listItem")
                        .getBindingContext("gvr")
                        .getObject()
                        .gv_no;

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteDisplay", {
                        gvrNo: sGvrNo
                    });
            },
            onSearchGVR: function (oEvent) {

                var sValue =
                    oEvent.getParameter("newValue");

                var oList =
                    this.byId("gvrList");

                var oBinding =
                    oList.getBinding("items");

                if (sValue) {

                    oBinding.filter([
                        new Filter(
                            "gv_no",
                            FilterOperator.Contains,
                            sValue
                        )
                    ]);

                } else {

                    oBinding.filter([]);

                }
            },
        onViewCustomerBillInfo() {


            var sGvrNo =
                this.getView()
                    .getModel("selectedGVR")
                    .getProperty("/gv_no");

            this.getOwnerComponent()
                .getRouter()
                .navTo("RouteCustomerBillDisplay", {
                    gvrNo: sGvrNo
                });
        },
       
    });

});