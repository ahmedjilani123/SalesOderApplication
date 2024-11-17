sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent", "sap/ui/core/routing/History"], function (Controller, UIComponent, History) {
	"use strict";

	return Controller.extend("sap.aj.controller.BaseController", {
		/**
		 * Convenience method for accessing the component of the controller's view.
		 * @returns {sap.ui.core.Component} The component of the controller's view
		 */
		getOwnerComponent: function () {
			return Controller.prototype.getOwnerComponent.call(this);
		},

		/**
		 * Convenience method to get the components' router instance.
		 * @returns {sap.m.routing.Router} The router instance
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the i18n resource bundle of the component.
		 * @returns {sap.base.i18n.ResourceBundle} The i18n resource bundle of the component
		 */
		getResourceBundle: function () {
			var oModel = this.getOwnerComponent().getModel("i18n");
			return oModel.getResourceBundle();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @param {string} [sName] The model name
		 * @returns {sap.ui.model.Model} The model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @param {sap.ui.model.Model} oModel The model instance
		 * @param {string} [sName] The model name
		 * @returns {sap.ui.core.mvc.Controller} The current base controller instance
		 */
		setModel: function (oModel, sName) {
			this.getView().setModel(oModel, sName);
			return this;
		},

		/**
		 * Convenience method for triggering the navigation to a specific target.
		 * @public
		 * @param {string} sName Target name
		 * @param {object} [oParameters] Navigation parameters
		 * @param {boolean} [bReplace] Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
		 */
		navTo: function (sName, oParameters, bReplace) {
			this.getRouter().navTo(sName, oParameters, undefined, bReplace);
		},

		/**
		 * Convenience event handler for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the main route.
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("main", {}, undefined, true);
			}
		},
		objectCreate:function(OEvent,id){
			var that=this;
			var ProductData = OEvent.getSource().getModel("createDataProduct").getData();
			var Total = parseInt(ProductData.Price) * parseInt(ProductData.Quantity);
			var CurrentDate = new Date();
			ProductData.CreateDate = CurrentDate.toLocaleDateString('en-GB');
			ProductData.PurchaseID = id;
			ProductData.GrossAmount = parseInt(Total);
			if (!ProductData.CategoryName){
				$.sap.CategoryName.setValueState("Error");	
			} else {
				$.sap.CategoryName.setValueState("None");
				if (!ProductData.ProductName){
					$.sap.ProductNameID.setValueState("Error");
				} else {
					$.sap.ProductNameID.setValueState("None");
					if (!ProductData.Quantity){
						$.sap.QuantityID.setValueState("Error");
					} else {
						$.sap.QuantityID.setValueState("None");
						if (!ProductData.Price){
							$.sap.PriceID.setValueState("Error");
						} else {
							$.sap.PriceID.setValueState("None");
						}
					}
				}
			}  
			return ProductData;
		},
		ProductIsSubmit: function (oEvent) {
			var ProductData =this.objectCreate(oEvent,$.sap.Mainpart.PurchaseID);
			var ItemData = this.getView().getModel("ItemsDatas").getData().ItemsData;
			var filterData =ItemData.filter(function(item){
				return item.PurchaseID == $.sap.Mainpart.PurchaseID;
			})
			var count = 0;
			filterData.forEach(function (item) {
				if (item.CategoryName == ProductData.CategoryName) {
					count++;
				}
			});
			if (count == 0) {
				ItemData.push(
					{
						"PurchaseID": $.sap.Mainpart.PurchaseID,
						"CategoryName": ProductData.CategoryName,
						"TotalAmount": ProductData.GrossAmount,
						"ModifyDate": ProductData.CreateDate,
						"UserName": $.sap.Mainpart.UserName,
						"ItemsLength": 1
					}
				)
			}
			$.sap.SubItemData = ProductData;
			oEvent.getSource().getModel("createDataProduct").refresh(true);
			//oEvent.getSource().getModel("createDataProduct").setData({});
			this.getView().getModel("ItemsDatas").refresh(true);
			this.onPressDetailBack();
			this.getView().byId("idConfirmButton").setEnabled(true);
			//	this.getView().getModel("SubItemDatas").refresh(true);

		},
		onCancelButtonPressView:function(o){
			this.onPressDetailBack();
			this.getView().getModel("createDataProduct").setData({});
			this.getView().byId("idConfirmButton").setEnabled(false);
		},
		confirmDataUPdate: function (oEvent) {
			this.getView().byId("SplitContDemo").to(this.getView().byId("ConfirmData"));
			
		},
		onConfirmButtonPressView:function(oEvent){
var that = this;

			if (Object.keys($.sap.SubItemData).length !== 0) {
				sap.m.MessageBox.confirm(
					"Category Name : " + $.sap.SubItemData.CategoryName + "\n" + " Product Name : " + $.sap.SubItemData.ProductName, {
					title: "Save The Created Product",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					emphasizedAction: sap.m.MessageBox.Action.YES,
					onClose: function (oAction) {
						if (oAction == "YES") {
							that.onPressDetailBack();
							var subItemProduct = that.getView().getModel("SubItemDatas").getData().subItem;
							subItemProduct.push($.sap.SubItemData);
							that.getView().byId("idConfirmButton").setEnabled(false);
						}
						$.sap.SubItemData = {};
						that.getView().getModel("createDataProduct").setData({});
						that.getView().getModel("SubItemDatas").refresh(true);
						
					}
				});
			}
		}
	});
});
