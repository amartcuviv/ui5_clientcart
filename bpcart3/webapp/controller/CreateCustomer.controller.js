sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
   // "sap/ui/comp/valuehelpdialog/ValueHelpDialog"
 
], function (Controller,  JSONModel, History, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("bpcart3.controller.EditCustomer", {
        /**
         * Called when the controller is instantiated
         */
        onInit: function () {
            // Create view models
            this._createViewModels();

            // Get router instance
            var oRouter = this.getOwnerComponent().getRouter();

            // Register for routeMatched event
            oRouter.getRoute("CreateCustomerView").attachPatternMatched(this._onRouteMatched, this);
        },

        /**
         * Create view models for the view
         * @private
         */
        _createViewModels: function () {
            // Customer model (initially empty)
            var oCustomerModel = new JSONModel();
            this.getView().setModel(oCustomerModel, "Customer");

            // Edit state model
            var oEditModel = new JSONModel({
                typeEditable: false,
                isDirty: false
            });
            this.getView().setModel(oEditModel, "editCustomer");

            // View state model
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0
            });
            this.getView().setModel(oViewModel, "editCustomerView");

            this.setCategoryData();

            // Crear un modelo global para los valores seleccionados
            var oGlobalModel = new JSONModel({
                selectedCategory: ""  // Valor por defecto
            });

            // Establecer el modelo global
            this.getView().setModel(oGlobalModel, "global");
        },

        /**
         * Handler for route matched event
         * @param {sap.ui.base.Event} oEvent Event object
         * @private
         */
        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var sPartnerId = oArgs.partnerId;

            // Set view to busy
            this._setBusy(true);

            // Load customer data for the specified partner ID

        },

        onCategoryChange: function(oEvent) {
            var oComboBox = oEvent.getSource();
            var selectedKey = oComboBox.getSelectedKey(); // Obtén la clave seleccionada
            let selectedText = oComboBox.getSelectedItem().getText(); // Obtén el texto del ítem seleccionado
            
              // Actualizar el valor global en el modelo
              var oGlobalModel = this.getView().getModel("global");
              oGlobalModel.setProperty("/selectedCategory", selectedKey);  // Guardamos la categoría seleccionada

        },

        setCategoryData:function(){
            var oModel = new sap.ui.model.json.JSONModel({
                Customer: {
                    Category: "",  // valor por defecto
                    Categories: [
                        { CategoryId: "001", CategoryName: "Persona" },
                        { CategoryId: "002", CategoryName: "Organización" }
                       
                    ]
                }
            });
            
            this.getView().setModel(oModel,"CategoryModel");
            
        },
        

 

        _setBusy: function (bBusy) {
            var oViewModel = this.getView().getModel("editCustomerView");
            oViewModel.setProperty("/busy", bBusy);
        },

        /**
         * Event handler for save button
         */
        onSave: function (oEvent) {
            // Validate form
            if (!this._validateForm(oEvent)) {
                return;
            }

            // Set view to busy during save
            this._setBusy(true);

            // Get customer data from model
            var oCustomerModel = this.getView().getModel("Customer");
            var oCustomerData = oCustomerModel.getData();

            // Process checkbox values to match backend expectations
            this._processDataForBackend(oCustomerData);

            // Update customer on backend
            this._updateCustomer(oCustomerData);
        },

        /**
         * Process data for backend to match expectations
         * @param {Object} oData Data to process
         * @private
         */
        _processDataForBackend: function (oData) {
            // Convert boolean checkbox values to X or empty
            if (oData.Natpers === true) {
                oData.Natpers = "X";
            } else if (oData.Natpers === false) {
                oData.Natpers = "";
            }
            
            //Convertimos categoría a un entero sin 0 por delante.
            oData.Category = parseInt(oData.Category, 10).toString();
        },

        /**
         * Update customer on backend
         * @param {Object} oCustomerData Customer data to update
         * @private
         */

        _updateCustomer: function (oCustomerData) {
            var oModel = this.getOwnerComponent().getModel();
            var sPath = "/BpCreateSet";
             
            oModel.create(sPath, oCustomerData, {
                method: "POST",
                success: function (data) {
                    // Mostrar mensaje de éxito
                    MessageToast.show(this.getResourceBundle().getText("customerUpdatedSuccess"));
                    
                    // Navegar de vuelta a la vista del cliente
                    this._navToCustomerView(oCustomerData.Partner);
                }.bind(this), // Bind to ensure `this` refers to the controller
        
                error: function (oError) {
                    // Mostrar mensaje de error si algo sale mal
                    MessageBox.error(this.getResourceBundle().getText("errorUpdatingCustomer"), {
                        details: oError.responseText
                    });
                    this._setBusy(false); // Detener el estado de "ocupado"
                }.bind(this) // Bind to ensure `this` refers to the controller
            });
        },
        

        /**
         * Validate form before save
         * @returns {boolean} True if form is valid, false otherwise
         * @private
         */
        _validateForm: function (oEvent) {
            var oCustomerModel = this.getView().getModel("Customer");
            var oCustomerData = oCustomerModel.getData();
            var bValid = true;
            
            var oGlobalModel = this.getView().getModel("global");
            var selectedCategory = oGlobalModel.getProperty("/selectedCategory");

            oCustomerData.Category = selectedCategory;

            // Check for required fields
            if (!oCustomerData.Category) {
                MessageBox.error(this.getResourceBundle().getText("requiredFieldMissing", ["Type"]));
                bValid = false;
            }

            // For organizations, check organization name
            if (oCustomerData.Category === "2" && !oCustomerData.NameOrg1) {
                MessageBox.error(this.getResourceBundle().getText("requiredFieldMissing", ["Organization Name"]));
                bValid = false;
            }

            // For persons, check first and last name
            if (oCustomerData.Category === "1") {
                if (!oCustomerData.NameFirst) {
                    MessageBox.error(this.getResourceBundle().getText("requiredFieldMissing", ["First Name"]));
                    bValid = false;
                }
                if (!oCustomerData.NameLast) {
                    MessageBox.error(this.getResourceBundle().getText("requiredFieldMissing", ["Last Name"]));
                    bValid = false;
                }
            }

            return bValid;
        },

        /**
         * Event handler for cancel button
         */
        onCancel: function () {
            // Check if form is dirty
            var oCustomerModel = this.getView().getModel("Customer");
            var oCurrentData = oCustomerModel.getData();
            var bIsDirty = !this._equals(oCurrentData, this._originalData);

            if (bIsDirty) {
                // Show confirmation dialog
                MessageBox.confirm(this.getResourceBundle().getText("cancelConfirmation"), {
                    title: this.getResourceBundle().getText("cancelTitle"),
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.YES) {
                            // Navigate back to customer view
                            this._navToCustomerView(oCurrentData.Partner);
                        }
                    }.bind(this)
                });
            } else {
                // Navigate back to customer view directly if no changes
                this._navToCustomerView(oCurrentData.Partner);
            }
        },

        /**
         * Navigate to customer view
         * @param {string} sPartnerId Partner ID to navigate to
         * @private
         */
        _navToCustomerView: function (sPartnerId) {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("CustomerView", {
                partnerId: sPartnerId
            });
        },

        /**
         * Compare two objects for equality
         * @param {Object} obj1 First object
         * @param {Object} obj2 Second object
         * @returns {boolean} True if objects are equal, false otherwise
         * @private
         */
        _equals: function (obj1, obj2) {
            return JSON.stringify(obj1) === JSON.stringify(obj2);
        },

        /**
         * Helper method to get i18n resource bundle
         * @returns {sap.ui.model.resource.ResourceModel} i18n resource model
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        }
    });
});