sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (Controller, History, JSONModel, MessageToast, MessageBox, Fragment) {
    "use strict";

    return Controller.extend("gvtracker.controller.BillInfo", {

        onInit: function () {

            var oBillModel = new JSONModel({
                bills: [{
                    slNo: 1,
                    billNo: "",
                    billValue: "",
                    image: "",
                    imageSource: ""
                }]
            });

            this.getView().setModel(oBillModel, "bill");

            this.getOwnerComponent()
                .getRouter()
                .getRoute("RouteBillInfo")
                .attachPatternMatched(
                    this._onRouteMatched,
                    this
                );
        },

        _onRouteMatched: function (oEvent) {

            var sMobile =
                oEvent.getParameter("arguments").mobile;

                this._giftValue =
                    parseFloat(
                        oEvent.getParameter("arguments").giftValue || 0
                    );

                console.log(
                    "Selected Gift Value:",
                    this._giftValue
                );

            console.log("Received Mobile:", sMobile);

            this.byId("inputBillCustomerMobile")
                .setValue(sMobile);

            this.byId("inputTotalCustomerBill")
                .setValue("0.00");
        },

        onAddRow: function () {

            var oModel =
                this.getView().getModel("bill");

            var aBills =
                oModel.getProperty("/bills");

            aBills.push({
                slNo: aBills.length + 1,
                billNo: "",
                billValue: "",
                image: "",
                 imageSource: ""
            });

            oModel.refresh();

            this.onBillValueChange();
        },

        onDeleteRow: function () {

            var oTable =
                this.byId("billTable");

            var aSelectedItems =
                oTable.getSelectedItems();

            if (!aSelectedItems.length) {

                MessageToast.show(
                    "Select row to delete"
                );

                return;
            }

            var oModel =
                this.getView().getModel("bill");

            var aBills =
                oModel.getProperty("/bills");

            for (var i = aSelectedItems.length - 1; i >= 0; i--) {

                var iIndex =
                    oTable.indexOfItem(
                        aSelectedItems[i]
                    );

                aBills.splice(iIndex, 1);
            }

            aBills.forEach(function (oRow, i) {
                oRow.slNo = i + 1;
            });

            oModel.refresh();

            this.onBillValueChange();
        },

       onBillValueChange: function () {

            var oTable = this.byId("billTable");
            var aItems = oTable.getItems();

            var fTotal = 0;

            aItems.forEach(function (oItem) {

                var aCells = oItem.getCells();

                // Bill Value column
                var sValue = aCells[2].getValue();

                fTotal += parseFloat(sValue || 0);

            });

            this.byId("inputTotalCustomerBill")
                .setValue(fTotal.toFixed(2));

        },

        _calculateTotal: function () {

            var oModel =
                this.getView().getModel("bill");

            var aBills =
                oModel.getProperty("/bills");

            var fTotal = 0;

            aBills.forEach(function (oBill) {

                fTotal += Number(
                    oBill.billValue || 0
                );

            });

            this.byId("inputTotalCustomerBill")
                .setValue(
                    fTotal.toFixed(2)
                );
        },
       

        onCameraPress: async function (oEvent) {

             this._oCurrentRow =
                oEvent.getSource()
                    .getParent()
                    .getBindingContext("bill");

            if (!this._oCameraDialog) {
                

                this._oCameraDialog =
                    await Fragment.load({
                        name: "gvtracker.fragment.Camera",
                        controller: this
                    });

                this.getView()
                    .addDependent(
                        this._oCameraDialog
                    );

                    
            }

            this._oCameraDialog.open();

            try {

                this._oStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true
                    });

                setTimeout(function () {

                    var oVideo =
                        document.getElementById(
                            "cameraVideo"
                        );

                    if (oVideo) {

                        oVideo.srcObject =
                            this._oStream;

                    }

                }.bind(this), 500);

            } catch (oError) {

                sap.m.MessageToast.show(
                    "Unable to access camera"
                );

                console.error(oError);
            }

        },
           


        onCapturePhoto: function () {

            var oVideo =
                document.getElementById(
                    "cameraVideo"
                );

            if (!oVideo) {

                sap.m.MessageToast.show(
                    "Camera not ready"
                );

                return;
            }

            var oCanvas =
                document.createElement(
                    "canvas"
                );

            oCanvas.width =
                oVideo.videoWidth;

            oCanvas.height =
                oVideo.videoHeight;

            var oContext =
                oCanvas.getContext(
                    "2d"
                );

            oContext.drawImage(
                oVideo,
                0,
                0
            );

            var sImage =
                oCanvas.toDataURL(
                    "image/png"
                );

            console.log(
                "Captured Image:",
                sImage
            );

            this._capturedImage =
                sImage;

            if (this._oCurrentRow) {

                var sPath =
                    this._oCurrentRow.getPath();

                var oModel =
                    this.getView().getModel("bill");

                oModel.setProperty(
                    sPath + "/image",
                    sImage
                );
                oModel.setProperty(
                    sPath + "/fileType",
                    "png"
                );


                oModel.setProperty(
                    sPath + "/imageSource",
                    "Camera"
                );
                oModel.refresh(true);
            }

            sap.m.MessageToast.show(
                "Photo Captured Successfully"
            );
            this.onCloseCamera();

        },
        onCloseCamera: function () {

            if (this._oStream) {

                this._oStream
                    .getTracks()
                    .forEach(function (oTrack) {

                        oTrack.stop();

                    });

            }

            this._oCameraDialog.close();

        },

        onButtonPress: function () {

            MessageToast.show(
                "Upload functionality coming next"
            );

        },
        onPreviewImage: function (oEvent) {

            var sImage =
                oEvent.getSource().getSrc();

            if (!this._oPreviewDialog) {

                this._oPreviewDialog =
                    new sap.m.Dialog({

                        title: "Bill Preview",

                        contentWidth: "70%",

                        contentHeight: "80%",

                        stretch: false,

                        endButton: new sap.m.Button({

                            text: "Close",

                            press: function () {

                                this._oPreviewDialog.close();

                            }.bind(this)

                        })

                    });

                this.getView()
                    .addDependent(
                        this._oPreviewDialog
                    );
            }

            this._oPreviewDialog.removeAllContent();

            this._oPreviewDialog.addContent(

                new sap.m.Image({
                    src: sImage,
                    width: "100%"
                })

            );

            this._oPreviewDialog.open();
        },
        onSubmit: function () {

                var aBills =
                    this.getView()
                        .getModel("bill")
                        .getProperty("/bills");

                // Validation
                for (var i = 0; i < aBills.length; i++) {

                    if (!aBills[i].billNo) {

                        MessageToast.show(
                            "Please enter Bill Number"
                        );
                        return;
                    }

                    if (!aBills[i].billValue) {

                        MessageToast.show(
                            "Please enter Bill Value"
                        );
                        return;
                    }

                    if (!aBills[i].image) {

                        MessageToast.show(
                            "Please Upload/Capture Bill Image"
                        );
                        return;
                    }
                }

                var fBillTotal =
                    parseFloat(
                        this.byId("inputTotalCustomerBill")
                            .getValue()
                    );

                if (fBillTotal > this._giftValue) {

                    MessageBox.warning(
                        "Total Bill Value cannot exceed Selected Gift Item Value (" +
                        this._giftValue.toFixed(2) +
                        ")"
                    );

                    return;
                }

                // Save bill info in Component Model
                var oBillDataModel = new sap.ui.model.json.JSONModel({
                    bills: aBills,
                    billAdded: true
                });

                this.getOwnerComponent().setModel(
                    oBillDataModel,
                    "billData"
                );

                MessageToast.show(
                    "Bill Information Added Successfully"
                );

                // Navigate back to Create Page
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteCreate");
            },
            onFileUpload: function (oEvent) {

                var oFile =
                    oEvent.getParameter("files")[0];

                console.log("Selected File:", oFile);

                if (!oFile) {
                    return;
                }

                var sFileName =
                    oFile.name;

                var sExtension =
                    sFileName.split(".").pop().toLowerCase();

                var oUploader =
                    oEvent.getSource();

                var oContext =
                    oUploader.getBindingContext("bill");

                var oModel =
                    this.getView().getModel("bill");

                var sPath =
                    oContext.getPath();

                oModel.setProperty(
                    sPath + "/fileType",
                    sExtension
                );

                oModel.setProperty(
                    sPath + "/fileName",
                    sFileName
                );

                var oReader =
                    new FileReader();

                oReader.onload = function (oLoadEvent) {

                    var sBase64 =
                        oLoadEvent.target.result;

                    oModel.setProperty(
                        sPath + "/image",
                        sBase64
                    );

                    oModel.setProperty(
                        sPath + "/imageSource",
                        "Browse"
                    );

                    oModel.refresh(true);

                    MessageToast.show(
                        "File Uploaded Successfully"
                    );

                }.bind(this);

                oReader.readAsDataURL(oFile);

            },
        onOpenPreview: function (oEvent) {

            var oRow =
                oEvent.getSource()
                    .getBindingContext("bill")
                    .getObject();

            if (oRow.image) {

                window.open(oRow.image, "_blank");

            }

        },

        onClose: function () {

            const sPreviousHash =
                History.getInstance()
                    .getPreviousHash();

            if (sPreviousHash !== undefined) {

                window.history.go(-1);

            } else {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteCreate");
            }
        }

    });
});