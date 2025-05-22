sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageToast, MessageBox, History) {
    "use strict";

    return Controller.extend("bpcart3.controller.MainView", {
        
        /**
         * Called when the controller is instantiated
         */
        onInit: function () {
            // Create a view model to track UI state
            var oViewModel = new JSONModel({
                selectedIndex: -1,
                selectedPartner: null
            });
            
            this.getView().setModel(oViewModel, "partnerTypeSmartTable");
            
            // Get reference to the SmartTable and Table
            this._oSmartTable = this.byId("partnerTypeSmartTable");
            this._oTable = this.byId("partnerTable");
            
            // Initialize the SmartFilterBar
            this._oSmartFilterBar = this.byId("smartFilterBar");
        },
        onInitSmartFilterBar: function(oEvent) {
            // Make sure this function is properly set up
            var oSmartFilter = oEvent.getSource();
            if (oSmartFilter) {
                // Force visibility of filter bar
                oSmartFilter.setVisible(true);
            }
        },
        onSearch:function(){},
        onClear:function(){},
        onDateChange:function(){

        },
        
        /**
         * Event handler for table selection change
         * @param {sap.ui.base.Event} oEvent The event object
         */
        onTableSelectionChange: function (oEvent) {
            var oViewModel = this.getView().getModel("partnerTypeSmartTable");
            var oSelectedItem = oEvent.getParameter("listItem");
            
            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext();
                var oSelectedPartner = oContext.getObject();
                var iSelectedIndex = oEvent.getSource().indexOfItem(oSelectedItem);
                
                // Update view model with selection information
                oViewModel.setProperty("/selectedIndex", iSelectedIndex);
                oViewModel.setProperty("/selectedPartner", oSelectedPartner);
            } else {
                // Clear selection when nothing is selected
                oViewModel.setProperty("/selectedIndex", -1);
                oViewModel.setProperty("/selectedPartner", null);
            }
        },
        
        onCreateCustomer: function(){
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("CreateCustomerView");

        },
     
        

        onNavToCustomer: function () {
            var oViewModel = this.getView().getModel("partnerTypeSmartTable");
            var oSelectedPartner = oViewModel.getProperty("/selectedPartner");
            
            if (oSelectedPartner) {
                // Check if partner is a customer type
                //if (oSelectedPartner.Type === "CUST" || oSelectedPartner.Type === "ZPRO") {
                    // Get router instance from component
                    var oRouter = this.getOwnerComponent().getRouter();
                    
                    // Navigate to customer view with partner ID
                    oRouter.navTo("CustomerView", {
                        partnerId: oSelectedPartner.Partner
                    });
              //  } else {
                //    MessageBox.information(this.getResourceBundle().getText("partnerNotCustomer"));
               // }
            } else {
                MessageToast.show(this.getResourceBundle().getText("noPartnerSelected"));
            }
        },
        
        /**
         * Helper method to get i18n resource bundle
         * @returns {sap.ui.model.resource.ResourceModel} i18n resource model
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        
        /**
         * Method called when the view is exited
         */
        onExit: function () {
            // Clean up any resources/references if needed
            this._oSmartTable = null;
            this._oTable = null;
            this._oSmartFilterBar = null;
        }
    });
});