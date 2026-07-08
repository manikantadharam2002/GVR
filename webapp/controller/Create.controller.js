sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/comp/filterbar/FilterBar",
    "sap/ui/comp/filterbar/FilterGroupItem"
], (
    Controller,
    History,
    Fragment,
    MessageBox,
    ValueHelpDialog,
    JSONModel,
    Filter,
    FilterOperator,
    FilterBar,
    FilterGroupItem
) => {    
        "use strict";

    return Controller.extend("gvtracker.controller.Create", {

        onInit() {

             
             this._sCustomerId = "";

            var oModel = this.getOwnerComponent().getModel();

            oModel.read("/ShoppingMallSet", {

                success: function (oData) {

                    if (oData.results.length > 0) {

                        this.byId("txtShoppingMall")
                            .setText(
                                oData.results[0].plant_code
                            );
                    }

                }.bind(this)

            });

            this.byId("txtGvrDate")
                .setText(
                    sap.ui.core.format.DateFormat
                        .getDateInstance({
                            pattern: "dd/MM/yyyy"
                        })
                        .format(new Date())
                );

            oModel.read("/GiftVoucherSet", {

                


                success: function (oData) {

                    oData.results.forEach(function (oItem) {

                        oItem.issueQty = 1;
                        oItem.selected = false;
                        oItem.ID = oItem.ID;

                    });

                    var oGiftModel = new JSONModel({
                        GiftVoucherSet: oData.results
                    });

                    this.getView().setModel(
                        oGiftModel,
                        "gift"
                    );

                }.bind(this)

            });

           
        },

        onCustomerValueHelp: function () {

            if (!this._oValueHelpDialog) {

                var oFilterBar = new FilterBar({

                    search: function () {

                        var oTable =
                            this._oValueHelpDialog.getTable();

                        if (oTable) {
                            oTable.getBinding("rows").refresh();
                        }

                    }.bind(this)

                });

                oFilterBar.addFilterGroupItem(

                    new FilterGroupItem({

                        groupName: "__BASIC",

                        name: "phone",

                        label: "Mobile Number",

                        control: new sap.m.Input()

                    })

                );

                oFilterBar.addFilterGroupItem(

                    new FilterGroupItem({

                        groupName: "__BASIC",

                        name: "name",

                        label: "Customer Name",

                        control: new sap.m.Input()

                    })

                );

                oFilterBar.addFilterGroupItem(

                    new FilterGroupItem({

                        groupName: "__BASIC",

                        name: "email",

                        label: "Customer Email",

                        control: new sap.m.Input()

                    })

                );

                this._oValueHelpDialog = new ValueHelpDialog({

                    title: "Select Customer",

                    supportMultiselect: false,

                    supportRanges: true,

                    key: "phone",

                    descriptionKey: "name",

                    filterBar: oFilterBar,

                    ok: function (oEvent) {

                        var aTokens =
                            oEvent.getParameter("tokens");

                        if (aTokens.length > 0) {

                            

                            var sPhone =
                                aTokens[0].getKey();

                            this.byId("inputCustMobileCreate")
                                .setValue(sPhone);

                            var oModel = this.getView().getModel();

                                oModel.read("/CustomerSet", {
                                    filters: [
                                        new sap.ui.model.Filter(
                                            "phone",
                                            sap.ui.model.FilterOperator.EQ,
                                            sPhone
                                        )
                                    ],
                                    success: function (oData) {

                                        if (oData.results.length > 0) {

                                            this._sCustomerId =
                                                oData.results[0].ID;

                                            console.log(
                                                "Customer ID:",
                                                this._sCustomerId
                                            );
                                        }

                                    }.bind(this)
                                });

                            this.byId("btnAddBillInfo")
                                .setEnabled(true);

                                
                            this.byId("btnAddCustomerProfile").setEnabled(false);

                            var oRow =
                                this._oValueHelpDialog
                                    .getTable()
                                    .getContextByIndex(0);

                        }

                        this._oValueHelpDialog.close();

                    }.bind(this),

                    cancel: function () {

                        this._oValueHelpDialog.close();

                    }.bind(this)

                });

                this.getView()
                    .addDependent(this._oValueHelpDialog);

                this._oValueHelpDialog.getTableAsync()
                    .then(function (oTable) {

                        if (oTable.bindRows) {

                            oTable.addColumn(
                                new sap.ui.table.Column({
                                    label: "Mobile Number",
                                    template: "phone"
                                })
                            );

                            oTable.addColumn(
                                new sap.ui.table.Column({
                                    label: "Customer Name",
                                    template: "name"
                                })
                            );

                            oTable.addColumn(
                                new sap.ui.table.Column({
                                    label: "Customer Email",
                                    template: "email"
                                })
                            );

                            oTable.setModel(
                                this.getView().getModel()
                            );

                            oTable.bindRows("/CustomerSet");
                        }

                        this._oValueHelpDialog.update();

                    }.bind(this));
            }

            this._oValueHelpDialog.open();
        },

        onSelectionChange: function () {
            this._calculateTotal();
        },
        onIncreaseQty: function (oEvent) {

            var oContext =
                oEvent.getSource().getBindingContext("gift");

            var oItem =
                oContext.getObject();

            var iQty =
                Number(oItem.issueQty || 1);

            if (iQty < Number(oItem.stock)) {

                oContext.getModel().setProperty(
                    oContext.getPath() + "/issueQty",
                    iQty + 1
                );

                this._calculateTotal();
            }
        },onDecreaseQty: function (oEvent) {

            var oContext =
                oEvent.getSource().getBindingContext("gift");

            var oItem =
                oContext.getObject();

            var iQty =
                Number(oItem.issueQty || 1);

            if (iQty > 1) {

                oContext.getModel().setProperty(
                    oContext.getPath() + "/issueQty",
                    iQty - 1
                );

                this._calculateTotal();
            }
        },
        
        _calculateTotal: function () {

            var oTable =
                this.byId("createGiftTable");

            var aItems =
                oTable.getItems();

            var fTotal = 0;

            aItems.forEach(function (oRow) {

                var oData =
                    oRow.getBindingContext("gift").getObject();

                if (oData.selected) {

                    fTotal +=
                         Number(oData.price) *
                        
                        Number(oData.issueQty || 1);
                }

            });

            this.byId("txtTotalValue")
                .setText(
                    "Total Assign Items Value : " +
                    fTotal.toFixed(2)
                );
        },
        onQtyChange: function (oEvent) {

            var oStepInput = oEvent.getSource();

            var oContext = oStepInput.getBindingContext("gift");

            var oItem = oContext.getObject();

            var iQty = Number(oStepInput.getValue());

            var iStock = Number(oItem.stock);

            if (iQty < 1) {
                iQty = 1;
            }

            if (iQty > iStock) {

                sap.m.MessageToast.show(
                    "Issue Qty cannot exceed Stock Qty (" + iStock + ")"
                );

                iQty = iStock;
            }

            oContext.getModel().setProperty(
                oContext.getPath() + "/issueQty",
                iQty
            );

            this._calculateTotal();
        },
        onBack() {
                    const sPreviousHash = History.getInstance().getPreviousHash();

                    if (sPreviousHash !== undefined) {
                        window.history.go(-1);
                    } else {

                    this.getOwnerComponent().getRouter().navTo("RouteHome");
                    }
                },formatDate: function (sDate) {

            if (!sDate) {
                return "";
            }

            return sap.ui.core.format.DateFormat
                .getDateInstance({
                    pattern: "dd/MM/yyyy"
                })
                .format(new Date(sDate));
        },
        onOpenCustomerProfile() {
            if (!this._oCustomerProfileDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "gvtracker.fragment.CustomerProfile",
                    controller: this
                }).then((oDialog) => {
                    this._oCustomerProfileDialog = oDialog;
                    this.getView().addDependent(oDialog);
                  oDialog.open();
                });
              } else {
                this._oCustomerProfileDialog.open();
                }
            },
            onCloseCustomerProfile() {
                this._oCustomerProfileDialog.close();  
            },
            onAddCustomer: function () {

                var oModel = this.getView().getModel();

                var oPayload = {

                    phone: parseInt(
                        this.byId("custMobile").getValue()
                    ),

                    name:
                        this.byId("custName").getValue(),

                    email:
                        this.byId("custEmail").getValue(),

                    phoneCode_code: parseInt(
                        this.byId("customerMobileSelect")
                            .getSelectedKey()
                    ),

                    salutation_code:
                        this.byId("customerNameSelect")
                            .getSelectedKey(),

                    shoppingMall_plant_code: 8208
                };

                console.log("Customer Payload", oPayload);

                oModel.create("/CustomerSet", oPayload, {

                    success: function (oData) {

                        sap.m.MessageToast.show(
                            "Customer Added Successfully"
                        );

                        this._sCustomerId = oData.ID;

                        this.byId("inputCustMobileCreate")
                            .setValue(oData.phone);

                        this.byId("btnAddBillInfo")
                            .setEnabled(true);

                        this.byId("btnAddCustomerProfile")
                            .setEnabled(false);

                        this._oCustomerProfileDialog.close();

                    }.bind(this),

                    error: function (oError) {

                        console.error(oError);

                        sap.m.MessageToast.show(
                            "Customer Creation Failed"
                        );

                    }

                });

            },
            onOpenBillInfo() {

                var aGiftData =
                    this.getView()
                        .getModel("gift")
                        .getProperty("/GiftVoucherSet");

                var bGiftSelected = false;
                var fGiftValue = 0;

                aGiftData.forEach(function (oItem) {

                    if (oItem.selected) {

                        bGiftSelected = true;

                        fGiftValue +=
                            Number(oItem.price) *
                            Number(oItem.issueQty || 1);
                    }

                });

                if (!bGiftSelected) {

                    sap.m.MessageBox.warning(
                        "Please select at least one Gift Item before adding Customer Bill Info."
                    );

                    return;
                }

                var sMobile =
                    this.byId("inputCustMobileCreate")
                        .getValue();

                console.log("Passing mobile:", sMobile);
                console.log("Calculated Gift Value:", fGiftValue);

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteBillInfo", {
                        mobile: sMobile,
                        giftValue: fGiftValue
                    });
            },
            onGiftSearch: function (oEvent) {

                var sValue = oEvent.getParameter("newValue");

                var oTable = this.byId("createGiftTable");

                var oBinding = oTable.getBinding("items");

                var aFilters = [];

                if (sValue) {

                    aFilters.push(
                        new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter(
                                    "material",
                                    sap.ui.model.FilterOperator.Contains,
                                    sValue
                                ),
                                new sap.ui.model.Filter(
                                    "descr",
                                    sap.ui.model.FilterOperator.Contains,
                                    sValue
                                ),
                                new sap.ui.model.Filter(
                                    "coupon",
                                    sap.ui.model.FilterOperator.Contains,
                                    sValue
                                ),
                                new sap.ui.model.Filter(
                                    "brand",
                                    sap.ui.model.FilterOperator.Contains,
                                    sValue
                                )
                            ],
                            and: false
                        })
                    );
                }

                oBinding.filter(aFilters);
            },
            onSave: function () {
                var oBillModel =
                    this.getOwnerComponent()
                        .getModel("billData");

                if (!oBillModel) {

                    sap.m.MessageBox.warning(
                        "Please Add Customer Bill Info before Submit"
                    );

                    return;
                }

                 

                if (!this._sCustomerId) {

                    sap.m.MessageToast.show(
                        "Please select customer"
                    );

                    return;
                }

                var oModel = this.getView().getModel();

                var sCustType =
                    this.byId("customerTypeSelect")
                        .getSelectedKey();

                var sCampaign =
                    this.byId("campaignSelect")
                        .getSelectedKey();

                var sComment =
                    this.byId("inputCreateComments")
                        .getValue();

                if (!sCustType) {
                    sap.m.MessageToast.show("Select Customer Type");
                    return;
                }

                if (!sCampaign) {
                    sap.m.MessageToast.show("Select Campaign");
                    return;
                }
                var aGiftData =
                        this.getView()
                            .getModel("gift")
                            .getProperty("/GiftVoucherSet");

                    var aAssignGiftVouchers = [];

                    aGiftData.forEach(function (oItem) {

                        if (oItem.selected) {

                            aAssignGiftVouchers.push({

                                giftVoucher_ID: oItem.ID,

                                issue_quantity: parseInt(oItem.issueQty || 1),

                                total_amount:
                                    (
                                        parseFloat(oItem.price) *
                                        parseInt(oItem.issueQty || 1)
                                    ).toFixed(2)

                            });

                        }

                    });

                    if (aAssignGiftVouchers.length === 0) {

                        sap.m.MessageToast.show(
                            "Please select at least one Gift Voucher"
                        );

                        return;
                    }
                    var fTotal = 0;

                        aAssignGiftVouchers.forEach(function (oItem) {

                            fTotal += Number(oItem.total_amount);

                        });

                var oPayload = {

                    employee_code: "102312",

                    cust_type_code:
                        this.byId("customerTypeSelect")
                            .getSelectedKey(),

                    campaign_name:
                        this.byId("campaignSelect")
                            .getSelectedKey(),

                    comment:
                        this.byId("inputCreateComments")
                            .getValue(),

                    customer_ID:
                        this._sCustomerId,

                    gvr_type_code: "CI",

                    shoppingMall_plant_code: 8208,

                    assignGiftsTotal_amt: fTotal.toFixed(2),

                     assignGiftVouchers:
                        aAssignGiftVouchers

                   
                };
                console.log("Payload", oPayload);
                console.log(
                        "assignGiftVouchers Payload",
                        aAssignGiftVouchers
                    );
                oModel.create("/GVHeaderSet", oPayload, {
                success: function (oData) {

                    MessageBox.success(

                        "Record Created Successfully\n\n" +
                        "Generated GVR Number : " +
                        oData.gv_no,

                        {
                            title: "GVR Created",

                           onClose: function () {

                            window.location.reload();

                        }.bind(this)
                        }

                    );

                    console.log("Created Record", oData);
                    console.log("GV Number =", oData.gv_no);

                }.bind(this),                });

            }


            

        
                
    

       
    });
});