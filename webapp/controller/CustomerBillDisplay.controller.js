sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
], (Controller, History, Filter, FilterOperator, JSONModel) => {
    "use strict";

    return Controller.extend(
        "gvtracker.controller.CustomerBillDisplay",
        {

            onInit() {

                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("RouteCustomerBillDisplay")
                    .attachPatternMatched(
                        this._onRouteMatched,
                        this
                    );
            },

            _onRouteMatched(oEvent) {

                var sGvrNo =
                    oEvent.getParameter("arguments").gvrNo;

                var oModel =
                    this.getView().getModel();

                var that = this;

                oModel.read("/GVHeaderSet", {

                    urlParameters: {
                        "$expand": "customer,bills/attachment"
                    },

                    filters: [
                        new Filter(
                            "gv_no",
                            FilterOperator.EQ,
                            sGvrNo
                        )
                    ],

                    success: function(oData) {

                        if (oData.results.length > 0) {

                            var oHeader =
                                oData.results[0];

                                 console.log(
                                        JSON.stringify(
                                            oHeader.bills.results[0].attachment,
                                            null,
                                            2
                                        )
                                    );

                            that.byId("inputGvrNo")
                                .setValue(oHeader.gv_no);

                            that.byId("inputCustomerMobile")
                                .setValue(oHeader.customer.phone);

                            var fTotal = 0;

                            oHeader.bills.results.forEach(
                                function(oBill) {

                                    fTotal += Number(
                                        oBill.b_amount
                                    );

                                }
                            );

                            that.byId("inputTotalBill")
                                .setValue(
                                    fTotal.toFixed(2)
                                );

                            oHeader.bills.results.forEach(function (oBill) {

                                if (oBill.attachment) {

                                    oBill.attachmentUrl =
                                        oBill.attachment.__metadata.media_src;

                                    oBill.fileName =
                                        oBill.attachment.fileName;
                                }

                            });

                            var oBillModel =
                                new JSONModel({
                                    items:
                                        oHeader.bills.results
                                });

                            that.getView().setModel(oBillModel, "billModel");
                            that.byId("customerBillTable");
                        }
                    },

                    error: function(oError) {
                        console.log(oError);
                    }
                });
            },
            onOpenAttachment: async function (oEvent) {

                var oData = oEvent.getSource()
                    .getBindingContext("billModel")
                    .getObject();

                var sFileName = oData.fileName || "";

                var sExt = sFileName
                    .split(".")
                    .pop()
                    .toLowerCase();

                // PDF / DOC / DOCX
                if (
                    sExt === "pdf" ||
                    sExt === "doc" ||
                    sExt === "docx"
                ) {

                    window.open(
                        oData.attachmentUrl,
                        "_blank"
                    );

                    return;
                }

                // Images
                if (!this._oPreviewDialog) {

                    this._oPreviewDialog =
                        await sap.ui.core.Fragment.load({
                            name: "gvtracker.fragment.ImagePreview",
                            controller: this
                        });

                    this.getView().addDependent(
                        this._oPreviewDialog
                    );
                }

                sap.ui.getCore()
                    .byId("previewImage")
                    .setSrc(oData.attachmentUrl);

                this._oPreviewDialog.open();
            },onClosePreview: function () {

                this._oPreviewDialog.close();

            },

            onClose: function () {

                                var sGvrNo = this.byId("inputGvrNo").getValue();

                                                this.getOwnerComponent()
                                                                    .getRouter()
                                                                                        .navTo("RouteDisplay", {
                                                                                                                gvrNo: sGvrNo
                                                                                                                                    });
                                                                                                                                                }
        }
    );
});