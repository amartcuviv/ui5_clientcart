sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library"
],
function (Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast, Spreadsheet, exportLibrary) {
    "use strict";

    return Controller.extend("fioriamlclient.fioritestclient.controller.MainView", {
        onInit: function () {
            // Crear un modelo JSON local para datos de ejemplo
           
            // var oModel = new JSONModel('/model/customers.json');
            
            // // Establecer el modelo en la vista
            // this.getView().setModel(oModel);
            var dataModel =   this.getOwnerComponent().getModel();   
			this.getView().setModel(dataModel, "CustomerModel");
 
            // Guardar referencia a la lista para uso posterior++            
            this._oList = this.byId("smartTable");
 

            //almacenar el conteo de clientes
            var oViewModelClientCount = new sap.ui.model.json.JSONModel({
                CustomerCount:0
            })

            this.getView().setModel(oViewModelClientCount,"viewModelClientCount");
            //Actualizar con el n de clientes
            this.getNumberOfClients();
         
        },

        onBeforeRebindTable: function(oEvent) {
            var oSmartTable = oEvent.getSource();
            var sFilter = "/ZFIORI_CLIENTE";
            oSmartTable.setTableBindingPath(sFilter);
        },
        onNavBack: function () {
            // Navegar hacia atrás en el historial del navegador
            const oHistory = sap.ui.core.routing.History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                // Si no hay historial, navegar a la página inicial
                const oRouter = this.getOwnerComponent().getRouter();
                //oRouter.navTo("home", {}, true);
            }
        },
        getNumberOfClients: function(){

            const oModel = this.getOwnerComponent().getModel();
            const that = this;
        
            oModel.read("/ZFIORI_CLIENTE", {
                success: function (oData) {
                    const iCount = oData.results.length;
                    that.getView().getModel("viewModelClientCount").setProperty("/CustomerCount", iCount);
                },
                error: function () {
                    sap.m.MessageToast.show("Error al cargar los datos");
                }
            });

        },
        
        
        onRefresh: function () {
            // En una aplicación real, aquí se recargarían los datos del backend
            MessageToast.show("Actualizando datos..");
            this.getNumberOfClients();
            //this.getNumberOfClients();
            // Simular actualización de datos tras un breve retraso
            setTimeout(() => {
               
                MessageToast.show("Datos actualizados" );
            }, 1000);
        },
        

        onAddCustomer: function () {
            // En una aplicación real, aquí se navegaría a un formulario de creación
            // o se abriría un diálogo para crear un nuevo cliente
                        // Ejemplo: Navegar a una vista de creación
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("createCustomer");

            //MessageBox.information("Función para agregar nuevo cliente");
            
        },
        
        onSearch: function (oEvent) {
            // Obtener el valor de búsqueda
            const sQuery = oEvent.getParameter("query");
            let aFilters = [];
            
            if (sQuery && sQuery.length > 0) {
                // Crear filtros para diferentes campos
                const aNameFilter = new Filter("Name", FilterOperator.Contains, sQuery);
                const aCompanyFilter = new Filter("Company", FilterOperator.Contains, sQuery);
                const aEmailFilter = new Filter("CustomerId", FilterOperator.Contains, sQuery);
                
                // Combinar filtros con operador OR
                aFilters = new Filter({
                    filters: [aNameFilter, aCompanyFilter, aEmailFilter],
                    and: false
                });
            }
            
            // Aplicar filtros a la lista
            const oBinding = this._oList.getBinding("items");
            oBinding.filter(aFilters);
            
            // Actualizar contador
            setTimeout(() => {
                const oModel = this.getView().getModel();
                const iCount = oBinding.getLength();
                oModel.setProperty("/CustomerCount", iCount);
            }, 100);
        },
        
        onSelectionChange: function(oEvent) {
            // Obtener el elemento seleccionado
            const oSelectedItem = oEvent.getParameter("listItem");
            //const oModel = oSelectedItem.getBindingContext("CustomerModel"); // Especifica el modelo
            
            const sCustomerId = oSelectedItem.getProperty("number");
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("customerDetail", {
                customerId: sCustomerId
            });

            //MessageToast.show(`Cliente seleccionado: ${oCustomer.Name}`);
        },
        
        
        onCustomerPress: function (oEvent) {
            // Obtener el elemento seleccionado
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext();
            const sCustomerId = oContext.getProperty("CustomerID");
            
            // Navegar al detalle del cliente
            // En una aplicación real, aquí se navegaría a la vista de detalle
            MessageToast.show(`Navegando al detalle del cliente: ${sCustomerId}`);
            
            // Ejemplo: Navegar a la vista de detalle
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("customerDetail", {
                customerId: sCustomerId
            });
        },
        
        onExport: function () {
            const oTable = this._oList;
            const oBinding = oTable.getBinding("items");
            const oModel = this.getView().getModel();
            const aCustomers = oModel.getProperty("/Customers");
            
            // Definir configuración para la exportación
            const oSettings = {
                workbook: {
                    columns: [
                        {
                            label: "ID Cliente",
                            property: "CustomerID",
                            type: EdmType.String
                        },
                        {
                            label: "Nombre",
                            property: "Name",
                            type: EdmType.String
                        },
                        {
                            label: "Empresa",
                            property: "Company",
                            type: EdmType.String
                        },
                        {
                            label: "Email",
                            property: "Email",
                            type: EdmType.String
                        },
                        {
                            label: "Teléfono",
                            property: "Phone",
                            type: EdmType.String
                        },
                        {
                            label: "Estado",
                            property: "Status",
                            type: EdmType.String
                        }
                    ]
                },
                dataSource: aCustomers,
                fileName: "Lista_Clientes.xlsx"
            };
            
            // Crear y exportar a Excel
            try {
                const oSpreadsheet = new Spreadsheet(oSettings);
                oSpreadsheet.build().then(() => {
                    MessageToast.show("Exportación completada");
                }).finally(() => {
                    oSpreadsheet.destroy();
                });
            } catch (error) {
                MessageBox.error("Error en la exportación: " + error.message);
            }
        }
    });
});
