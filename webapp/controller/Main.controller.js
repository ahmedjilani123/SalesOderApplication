sap.ui.define(["./BaseController", "sap/m/MessageBox", "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",'sap/ui/core/Fragment',"sap/ui/model/Sorter"], function (BaseController, MessageBox, Filter, FilterOperator,Fragment,Sorter) {
		"use strict";
		var array=[];
		return BaseController.extend("sap.aj.controller.Main", {
			onInit:function(oEvent){
				if(oEvent.getParameters("id").id == "__xmlview1"){
					var viewTable = this.getView().byId("ItemViewTable");
					this.listID = this.getView().byId("MasterListItem");
					$.sap.CategoryName =this.getView().byId("CategoryId")
					$.sap.PriceID =this.getView().byId("PriceID")
					$.sap.QuantityID =this.getView().byId("QuantityID")
					$.sap.ProductNameID =this.getView().byId("ProductNameId")
				
				}
				
			},
			onAfterRendering:function(){
				var MasterMainData =this.getView().getModel("MasterDatas").getData().MasterData;
				this.getView().getModel("MasterFilterData").setProperty("/MasterData",MasterMainData);
				this.getView().getModel("MasterFilterData").refresh(true)
			
			},
			refreshbuttonPress:function(){
				this.onAfterRendering();

			},
			onAvatarPressed:function(){
				sap.m.MessageToast.show("welcome");
			},
			onListItemPress: function (oEvent) {
				var that =this;
				this.splitContOjb = this.getView().byId("SplitContDemo")
				var mainpart = this.getView().getModel("MasterDatas").getData().MasterData;
				this.mainpartfilter = oEvent.getSource().getBindingContext("MasterFilterData");
				var data = this.mainpartfilter.getPath().split("/MasterData/").join("");
				this.mainpart =mainpart[parseInt(data)];
				$.sap.Mainpart = this.mainpart;
				
				var arr=["ConfirmData","ItemDetails","CreatePage","detail"];
				arr.forEach(function(item){
					var detal = that.getView().byId(item);
					detal.bindElement({ path: 'MasterDatas>/MasterData/' + data });
				})
				var filterdata = new Filter("PurchaseID", FilterOperator.EQ, this.mainpart.PurchaseID);
				var oList = this.getView().byId("itemTable");
				var oBinding = oList.getBinding("items");
				oBinding.filter(filterdata);
				this.getView().byId("SplitContDemo").to(this.createId("detail"));
			},
			NavigationToItem: function (oEvent) {
				this.getView().byId("SplitContDemo").to(this.createId("ItemDetails"));
				var subItemDatas = this.getView().getModel("SubItemDatas").getData().subItem;
					var OeventData = oEvent.getSource().getBindingContext("ItemsDatas").getObject()
			var filterData =subItemDatas.filter(function(item){
				return item.PurchaseID == OeventData.PurchaseID && item.CategoryName == OeventData.CategoryName;
			})

				this.getView().getModel("SubItemDatas").setProperty("/FilterData",filterData)

			},
			onPressDetailBack: function () {
				this.getView().byId("SplitContDemo").backDetail();

			},
			onPressCreateDetailBack:function(){
				this.onPressDetailBack();
			this.getView().getModel("createDataProduct").setData({});
			},
			
			CreateOderPro: function (oEvent) {

				this.getView().byId("SplitContDemo").to(this.getView().byId("CreatePage"));
				var ItemdataCate = this.getView().getModel("ItemsDatas").getData();
				var StringToData = JSON.stringify(ItemdataCate);
				const mapFromColors = new Map(
					JSON.parse(StringToData).ItemsData.map(c => [c.CategoryName, c])
				  );
				  const uniqueColors = {ItemsData:[...mapFromColors.values()]};
				this.getView().getModel("comboboxData").setData(uniqueColors);
				this.getView().getModel("comboboxData").refresh(true);
			},
			onFilterButtonPress:function(oEvent) {
				var oButton = oEvent.getSource(),
				oView = this.getView();
                  var masterData= this.getView().getModel("MasterDatas").getData().MasterData[0];
				  var newDisplayData =[];
				  var displayKey = this.getView().getModel("DisplayKey");
				  for(var x in masterData) {
					newDisplayData.push({"filterKey":x})
				  }
				  displayKey.setProperty("/FilterKey",newDisplayData);
				  displayKey.refresh(true);

	
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.aj.Fragments.FilterObject",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
			
					return oPopover;
				});
			}
			this._pPopover.then(function(oPopover) {
				oPopover.openBy(oButton);
			});
			},
			FilterSelectionChangePress:function(oEvent){
			   if (oEvent.getParameters("selected").selected){
				var data = oEvent.getParameters("selected").listItem.getBindingContext("DisplayKey").getObject()
				array.push(data);
				this.getView().byId("countSelectedItem").setText(array.length);
			   }else{
				var data = oEvent.getParameters("selected").listItem.getBindingContext("DisplayKey").getObject()
				for (var i = 0; i < array.length; i++) {
					var obj = array[i];
					if (data.filterKey.indexOf(obj.filterKey) !== -1) {
						array.splice(i, 1);
					}
				}
				this.getView().byId("countSelectedItem").setText(array.length);
			   }
				
			},
			FilterObjectOkPress:function(oEvent){
                 var MainDataArray =[];
				 if(array.length >0){
					var MainObjectSetList = this.getView().getModel("MasterDatas").getData().MasterData;
					MainObjectSetList.forEach(function(item){
						var objectdata={};
						array.forEach(function(arr){
							if(item.hasOwnProperty(arr.filterKey)){
								var data = item;
								objectdata[arr.filterKey]= data[arr.filterKey]
							}
						})
						MainDataArray.push(objectdata);
					})
					var FilterData =this.getView().getModel("MasterFilterData")
					FilterData.setProperty("/MasterData",MainDataArray);
					this.getView().getModel("MasterFilterData").refresh(true)
					oEvent.getSource().getParent().getParent().close();
				 }
				 oEvent.getSource().getParent().getParent().close();
			},
			searchMasterDataPress:function(oEvent){
				this.listID = this.getView().byId("MasterListItem");
				var filterdata = new Filter("UserName", FilterOperator.Contains, oEvent.getSource().getValue());
				var oBinding = this.listID.getBinding("items");
				oBinding.filter(filterdata);
			},
			SortingMasterDataPress:function(oEvent){
				this.listID = this.getView().byId("MasterListItem");
				var filterdata = new Sorter("UserName",!oEvent.getParameters("pressed").pressed);
				var oBinding = this.listID.getBinding("items");
				oBinding.sort(filterdata);
			},
			FilterObjectCancelPress:function(oEvent){
				oEvent.getSource().getParent().getParent().close();
			},
			AddMasterDataPress:function(oEvent){
				this.CreateDialog=undefined;
				if(!this.CreateDialog){
					this.CreateDialog = new sap.ui.xmlfragment("sap.aj.Fragments.MasterDataCreate",this);
					this.getView().addDependent(this.CreateDialog);
				}
				this.CreateDialog.open();
				
			},
			objectCreateMaster:function(OEvent,arr){
				var that=this;

				var validate;
				if (!OEvent.UserName){
					arr[0].setValueState("Error");	
					validate =false;
				} else {

					arr[0].setValueState("None");
					validate =true;
					if (!OEvent.CompanyName){
						arr[1].setValueState("Error");
						validate =false;
					} else {
						arr[1].setValueState("None");
						validate =true;
						if (!OEvent.TotalAmount){
							arr[2].setValueState("Error");
							validate =false;
						} else {
						arr[2].setValueState("None");
						validate =true;
							if (!OEvent.AddressTo){
								arr[3].setValueState("Error");
								validate =false;
							} else {
								arr[3].setValueState("None");
								validate =true;
							}
						}
					}
				}  
				return validate;
			},
			SaveMasterDataPress:function(oEvent){
			
				var PurchaseID = Math.floor((Math.random()*1000000)+1);
				var CurrentDate = new Date();
		
					var MasterObject = this.getView().getModel("MasterDataCreated").getData();
					MasterObject.PurchaseID = PurchaseID;
					MasterObject.TotalAmount =parseFloat(MasterObject.TotalAmount);
					MasterObject.DeliveryDate = CurrentDate.toLocaleDateString('en-GB');
					var arr = [sap.ui.getCore().byId("UserNameMasterID"),sap.ui.getCore().byId("CompanyNameMasterID"),sap.ui.getCore().byId("TotalAmountMasterID"),sap.ui.getCore().byId("AddressToMasster")]
					var validate =this.objectCreateMaster(MasterObject,arr);
					if(validate){
						var MasterData = this.getView().getModel("MasterDatas").getData().MasterData;
						MasterData.push(MasterObject);
						this.onAfterRendering();
						this.getView().getModel("MasterDatas").refresh(true);
						this.CreateDialog=undefined;
						oEvent.getSource().getParent().destroy();
						this.getView().getModel("MasterDataCreated").setData({});
						this.getView().getModel("MasterDataCreated").refresh(true)

					}
					
					
			},
			CloseMasterDataPress:function(oEvent){
				this.CreateDialog=undefined;
				oEvent.getSource().getParent().destroy();
				
			}
			
		});
	});
