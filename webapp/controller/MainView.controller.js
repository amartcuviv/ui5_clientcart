sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast, Spreadsheet, exportLibrary) {
    "use strict";

    const EdmType = exportLibrary.EdmType;

    return Controller.extend("fioritest.fioritest.controller.MainView", {
        onInit: function () {
            // Crear un modelo JSON local para datos de ejemplo
            const oModel = new JSONModel({
                Customers: [
                    {
                        CustomerID: "C001",
                        Name: "Juan Pérez",
                        Company: "Empresa ABC",
                        Email: "juan.perez@empresaabc.com",
                        Phone: "+34 123 456 789",
                        Status: "Active"
                    },
                    {
                        CustomerID: "C002",
                        Name: "María López",
                        Company: "Corporación XYZ",
                        Email: "maria.lopez@corpxyz.com",
                        Phone: "+34 987 654 321",
                        Status: "Active"
                    },
                    {
                        CustomerID: "C003",
                        Name: "Carlos Rodríguez",
                        Company: "Industrias 123",
                        Email: "carlos.rodriguez@ind123.com",
                        Phone: "+34 555 123 456",
                        Status: "Inactive"
                    }
                ],
                CustomerCount: 3
            });
            
            // Establecer el modelo en la vista
            this.getView().setModel(oModel);
            
            // Guardar referencia a la lista para uso posterior
            this._oList = this.byId("customerList");
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
                oRouter.navTo("home", {}, true);
            }
        },
        
        onRefresh: function () {
            // En una aplicación real, aquí se recargarían los datos del backend
            MessageToast.show("Actualizando datos...");
            
            // Simular actualización de datos tras un breve retraso
            setTimeout(() => {
                const oModel = this.getView().getModel();
                oModel.setProperty("/CustomerCount", oModel.getProperty("/Customers").length);
                MessageToast.show("Datos actualizados");
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
                const aEmailFilter = new Filter("Email", FilterOperator.Contains, sQuery);
                
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
        
        onSelectionChange: function (oEvent) {
            // Obtener el elemento seleccionado
            const oSelectedItem = oEvent.getParameter("listItem");
            const oContext = oSelectedItem.getBindingContext();
            const sPath = oContext.getPath();
            const oCustomer = oContext.getObject();
            
            MessageToast.show(`Cliente seleccionado: ${oCustomer.Name}`);
            
            // Aquí se podrían realizar acciones adicionales basadas en la selección
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
            // const oRouter = this.getOwnerComponent().getRouter();
            // oRouter.navTo("customerDetail", {
            //     customerId: sCustomerId
            // });
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