sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, History, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("bpcart3.controller.CustomerView", {
        
        /**
         * Called when the controller is instantiated
         */
        onInit: function () {
            // Create view models
            this._createViewModels();
            
            // Get router instance
            var oRouter = this.getOwnerComponent().getRouter();
            
            // Register for routeMatched event
            oRouter.getRoute("CustomerView").attachPatternMatched(this._onRouteMatched, this);
        },
        
        /**
         * Create view models for the view
         * @private
         */
        _createViewModels: function() {
            // Orders model (initially empty)
            var oOrdersModel = new JSONModel({
                results: []
            });
            this.getView().setModel(oOrdersModel, "Orders");
            
            // Customer model (initially empty)
            var oCustomerModel = new JSONModel();
            this.getView().setModel(oCustomerModel, "Customer");
            
            // View state model
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                selectedTabKey: "general",
                editMode: false
            });
            this.getView().setModel(oViewModel, "customerView");
        },
        
        /**
         * Handler for route matched event
         * @param {sap.ui.base.Event} oEvent Event object
         * @private
         */
        _onRouteMatched: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var sPartnerId = oArgs.partnerId;
            
            // Set view to busy
            this._setBusy(true);
            
            // Load customer data for the specified partner ID
            this._loadCustomerData(sPartnerId);
        },
        
        /**
         * Load customer data from backend
         * @param {string} sPartnerId Partner ID to load
         * @private
         */
        _loadCustomerData: function(sPartnerId) {
            var oModel = this.getOwnerComponent().getModel();
            var sPath = "/PartnerTypeSet('" + sPartnerId + "')";

            
            
            // Read customer data
            oModel.read(sPath, {
                success: function(oData) {
                    // Set customer data to model
                    var oCustomerModel = this.getView().getModel("Customer");
                    oCustomerModel.setData(oData);
                    this._setBusy(false);
                    // Load orders for this customer
                    //this._loadCustomerOrders(sPartnerId);
                }.bind(this),
                error: function(oError) {
                    // Handle error
                    MessageBox.error(this.getResourceBundle().getText("errorLoadingCustomer"), {
                        details: oError.responseText
                    });
                    this._setBusy(false);
                }.bind(this)
            });
        },
        
        /**
         * Load customer orders from backend
         * @param {string} sPartnerId Partner ID to load orders for
         * @private
         */
        _loadCustomerOrders: function(sPartnerId) {
            var oModel = this.getOwnerComponent().getModel();
            var sPath = "/CustomerOrdersSet";
            
            // Read orders for this customer
            oModel.read(sPath, {
                urlParameters: {
                    "$filter": "Partner eq '" + sPartnerId + "'"
                },
                success: function(oData) {
                    // Set orders to model
                    var oOrdersModel = this.getView().getModel("Orders");
                    oOrdersModel.setData(oData);
                    
                    // Set view to not busy
                    this._setBusy(false);
                }.bind(this),
                error: function(oError) {
                    // Handle error
                    MessageToast.show(this.getResourceBundle().getText("errorLoadingOrders"));
                    this._setBusy(false);
                }.bind(this)
            });
        },
        
        /**
         * Set busy state of the view
         * @param {boolean} bBusy Busy state
         * @private
         */
        _setBusy: function(bBusy) {
            var oViewModel = this.getView().getModel("customerView");
            oViewModel.setProperty("/busy", bBusy);
        },
        
        /**
         * Event handler for refresh orders button
         */
        onRefreshOrders: function() {
            var oCustomerModel = this.getView().getModel("Customer");
            var sPartnerId = oCustomerModel.getProperty("/Partner");
            
            if (sPartnerId) {
                // Set orders tab to busy
                this._setBusy(true);
                
                // Reload orders
                this._loadCustomerOrders(sPartnerId);
            }
        },
        
        /**
         * Event handler for order item press
         * @param {sap.ui.base.Event} oEvent Event object
         */
        onOrderPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext("Orders");
            var sOrderId = oContext.getProperty("OrderId");
            
            // Navigate to order details
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("OrderDetails", {
                orderId: sOrderId
            });
        },
        
        /**
         * Event handler for edit customer button
         */
        onEditCustomer: function() {
            var oCustomerModel = this.getView().getModel("Customer");
            var sPartnerId = oCustomerModel.getProperty("/Partner");
            
            // Navigate to edit customer view
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("EditCustomer", {
                partnerId: sPartnerId
            });
        },
        
        /**
         * Event handler for create order button
         */
        onCreateOrder: function() {
            var oCustomerModel = this.getView().getModel("Customer");
            var sPartnerId = oCustomerModel.getProperty("/Partner");
            
            // Navigate to create order view with partner ID
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("CreateOrder", {
                partnerId: sPartnerId
            });
        },
        
        /**
         * Event handler for back button
         */
        onNavBack: function() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            
            if (sPreviousHash !== undefined) {
                // Navigate back in history
                window.history.go(-1);
            } else {
                // Navigate to main view
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("MainView", {}, true);
            }
        },
        
        /**
         * Helper method to get i18n resource bundle
         * @returns {sap.ui.model.resource.ResourceModel} i18n resource model
         */
        getResourceBundle: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        }
    });
});