sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("fioritest.fioritest.controller.CreateCustomer", {
        onInit: function () {
            // Crear un modelo para almacenar los datos del nuevo cliente
            const oModel = new JSONModel({
                customero: {
                    CustomerID: "",
                    Name: "",
                    Company: "",
                    Email: "",
                    Phone: "",
                    Status: "Active"
                }
            });

            this.getView().setModel(oModel);

            // Obtener el router para manejar eventos de navegación
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("createCustomer").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            // Reiniciar el formulario cuando se navega a esta vista
            const oModel = this.getView().getModel();
            oModel.setData({
                customero: {
                    CustomerID: this._generateCustomerId(),
                    Name: "",
                    Company: "",
                    Email: "",
                    Phone: "",
                    Status: "Active"
                }
            });
        },

        _generateCustomerId: function () {
            // Generar un ID aleatorio para el nuevo cliente
            return "C" + Math.floor(1000 + Math.random() * 9000);
        },

        onNavBack: function () {
            // Navegar de vuelta a la lista
            this.oRouter.navTo("main");
        },

        onCancelPress: function () {
            this.onNavBack();
        },

        onSavePress: function () {
            // Validar entradas
            if (!this._validateInputs()) {
                return;
            }

            // Obtener datos del cliente
            const oModel = this.getView().getModel();
            const oNewCustomer = oModel.getProperty("/customero");

            // Acceder al modelo de clientes
            var dataModel = this.getOwnerComponent().getModel("CustomerModel");
            let customerArray = dataModel.getProperty("/Customers") || [];

            // Añadir el nuevo cliente
            customerArray.push(oNewCustomer);
            dataModel.setProperty("/Customers", customerArray);

            // En una aplicación real, aquí se guardarían los datos en el backend
            MessageBox.confirm(
                "¿Desea guardar este nuevo cliente?",
                {
                    title: "Confirmar",
                    onClose: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                            // Simulación de guardado
                            MessageToast.show("Cliente guardado correctamente");

                            // Navegación de vuelta a la lista
                            this.onNavBack();
                        }
                    }
                }
            );
        },

        _validateInputs: function () {
            // Obtener valores de los campos obligatorios
            const sCustomerId = this.byId("customerIdInput").getValue();
            const sName = this.byId("nameInput").getValue();
            const sEmail = this.byId("emailInput").getValue();

            // Validar que los campos obligatorios no estén vacíos
            if (!sCustomerId || !sName || !sEmail) {
                MessageBox.error("Por favor complete todos los campos obligatorios");
                return false;
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(sEmail)) {
                MessageBox.error("Por favor ingrese un email válido");
                return false;
            }

            return true;
        }
    });
});
