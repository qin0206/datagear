/*
 * Copyright 2018 datagear.tech. All Rights Reserved.
 */

/**
 * 表单组件。
 * 依赖:
 * jquery.js
 * jquery-ui.js
 * jquery.fileupload.js
 * datagear-model.js
 * datagear-util.js
 * jquery.validate.js
 */
(function($, undefined)
{
	$.widget("datagear.modelform",
	{
		options:
		{
			//必选，表单模型
			model : undefined,
			
			//可选，忽略的属性名称，可以是数组或者单个字符串
			ignorePropertyNames : undefined,
			
			//可选，是否渲染指定属性，此设置优先级低于ignorePropertyNames
			renderProperty : function(property, propertyIndex)
			{
				return true;
			},
			
			//可选，表单数据
			data : undefined,
			
			//可选，表单提交action
			action : "#",
			
			//可选，是否只读
			readonly : false,
			
			//可选，提交处理函数，返回false将阻止默认提交行为
			submit : function(){},
			
			//可选，重置处理函数，返回false将阻止默认重置行为
			reset : function(){},
			
			//"readonly=false"时必须，添加单元属性值处理函数
			addSinglePropertyValue : function(property, propertyConcreteModel){ throw new Error("TODO"); },
			
			//"readonly=false"时必须，编辑单元属性值处理函数
			editSinglePropertyValue : function(property, propertyConcreteModel, propertyValue){ throw new Error("TODO"); },
			
			//"readonly=false"时必须，删除单元属性值处理函数
			deleteSinglePropertyValue : function(property, propertyConcreteModel, propertyValue){ throw new Error("TODO"); },
			
			//"readonly=false"时必须，选择单元属性值处理函数
			selectSinglePropertyValue : function(property, propertyConcreteModel, propertyValue){ throw new Error("TODO"); },
			
			//"readonly=true"时必须，查看单元属性值处理函数
			viewSinglePropertyValue : function(property, propertyConcreteModel, propertyValue){ throw new Error("TODO"); },
			
			//"readonly=false"时必须，编辑多元属性值处理函数
			editMultiplePropertyValue : function(property, propertyConcreteModel, propertyValue){ throw new Error("TODO"); },
			
			//"readonly=true"时必须，查看多元属性值处理函数
			viewMultiplePropertyValue : function(property, propertyConcreteModel, propertyValue){ throw new Error("TODO"); },
			
			//"readonly=false"时必须，文件属性值上传地址
			filePropertyUploadURL : "",
			
			//可选，文件属性值上传时的文件参数名
			filePropertyUploadParamName : "file",
			
			//"readonly=false"时必须，文件属性值删除地址
			filePropertyDeleteURL : "",
			
			//可选，文件属性值删除时的文件参数名
			filePropertyDeleteParamName : "file",
			
			//可选，文件属性值是否采用可展示值对象，而非基本文件名称值
			//详细信息对象格式参考：$.model.toShowableValue
			filePropertyReturnShowableValue : false,
			
			//"readonly=false"时必须，下载单元文件属性值处理函数
			downloadSinglePropertyValueFile : function(property, propertyConcreteModel){ throw new Error("TODO"); },
			
			//可选，使用文本域而非文本框的长度阀值
			asTextareaLength : 101,
			
			//可选，验证规则required, 是否按照添加操作的规则来执行required规则
			//添加操作时对于NotNull特性，如果又有AutoGenerated或者ValueGenerator特性，则不需要required
			validationRequiredAsAdd : false,
			
			//可选，日期格式
			dateFormat : "",
			
			//可选，SQL日期格式
			sqlDateFormat : "",
			
			//可选，SQL时间戳格式
			sqlTimestampFormat : "",
			
			//可选，SQL时间格式
			sqlTimeFormat : "",
			
			//可选，是否开启批量设置
			batchSet : false,
			
			//batchSet=true时必选，批量执行数目参数名
			batchCountParamName : "batchCount",
			
			//batchSet=true时必选，批量执行出错处理方式参数名
			batchHandleErrorModeParamName : "batchHandleErrorMode",
			
			//batchSet=true时必选，批量执行出错处理方式枚举
			batchHandleErrorModeEnum : ["IGNORE", "ABORT", "ROLLBACK"],
			
			//可选，标签
			labels :
			{
				add : "添加",
				edit : "编辑",
				del : "删除",
				view : "查看",
				select : "选择",
				submit : "保存",
				reset : "重置",
				uploadFile : "上传",
				downloadFile : "下载",
				batchSet :
				{
					batchSetSwitchTitle : "批量添加设置",
					batchCount : "批量添加数目",
					batchHandleErrorMode : "出错时",
					batchHandleErrorModeEnum : ["忽略", "中止", "撤销"]
				},
				validation :
				{
					"required" : "此项必填"
				}
			}
		},
		
		//form元素ID
		_formId : undefined,
		
		//属性组件映射表“name:{}”
		_propertyWidgets : undefined,
		
		_create: function()
		{
			if(!this.element.is("form"))
				throw new Error("The DOM must be <form>");
			
			this.element.addClass("form");
			
			var options=this.options;
			var model=options.model;
			
			options.data =  $.model.instance(model, options.data);
			
			this.element.attr("action", options.action);
			
			//处理form元素ID
			this._formId = this.element.attr("id");
			if(!this._formId)
			{
				this._formId = $.uid("form");
				this.element.attr("id", this._formId);
			}
			
			this._propertyWidgets = {};
			
			var $formHead = $("<div class='form-head' />").appendTo(this.element);
			var $formContent = $("<div class='form-content' />").appendTo(this.element);
			var $formFoot = $("<div class='form-foot' />").appendTo(this.element);
			
			this._render($formHead, $formContent, $formFoot);
			
			var maxHeight = $(window).height();
			
			if($.isInDialog(this.element))
				maxHeight = maxHeight - maxHeight/4;
			else
			{
				maxHeight = maxHeight - $formHead.outerHeight();
				maxHeight = maxHeight - $formFoot.outerHeight();
				maxHeight = maxHeight - 10;
			}
			
			if(maxHeight < 50)
				maxHeight = 50;
			
			$formContent.css("max-height", maxHeight+"px").css("overflow", "auto");
		},
		
		_destroy: function()
		{
			if(!this.options.readonly)
			{
				var validator = this.element.validate();
				validator.destroy();
			}
			
			$(".form-foot", this.element).remove();
			$(".form-content", this.element).remove();
			$(".form-head", this.element).remove();
			
			this.element.removeClass("form");
		},
		
		_setOption: function(key, value)
		{
			this._super(key, value);
		},
		
		/**
		 * 获取/设置数据对象。
		 */
		data : function(data)
		{
			var properties = this.options.model.properties;
			
			if(arguments.length == 0)
			{
				data = $.extend({}, this.options.data);
				
				for(var i=0; i<properties.length; i++)
				{
					var property = properties[i];
					var propName = property.name;
					
					if(this._isIgnorePropertyName(property, i))
						continue;
					
					if($.model.hasFeatureNotReadable(property))
						continue;
					
					var propValue = this._propertyWidgets[propName].getValue();
					$.model.propertyValue(data, propName, propValue);
				}
				
				return data;
			}
			else
			{
				for(var i=0; i<properties.length; i++)
				{
					var property = properties[i];
					var propName = property.name;
					
					if(this._isIgnorePropertyName(property, i))
						continue;

					if($.model.hasFeatureNotReadable(property))
						continue;
					
					var propValue = $.model.propertyValue(data, propName);
					this._propertyWidgets[propName].setValue(propValue);
				}
			}
		},
		
		/**
		 * 获取/设置属性值。
		 * 
		 * @param propName
		 * @param propValue
		 */
		propValue : function(propName, propValue)
		{
			if(arguments.length == 1)
			{
				var re = this._propertyWidgets[propName].getValue();
				
				//这里不能直接返回undefined，jquery-ui会处理undefined而返回jquery-ui元素
				return (re == undefined ? null : re);
			}
			else
			{
				var propertyIndex = $.model.getPropertyIndex(this.options.model, propName);
				var property = $.model.getProperty(this.options.model, propertyIndex);
				
				if(!this._isIgnorePropertyName(property, propertyIndex))
					this._propertyWidgets[propName].setValue(propValue);
			}
		},
		
		/**
		 * 获取除数据以外的参数对象，比如options.batchCountParamName、options.batchHandleErrorModeParamName参数。
		 */
		param : function()
		{
			var options = this.options;
			
			var batchCount = parseInt($("input[name='"+options.batchCountParamName+"']", this.element).val());
			var batchHandleErrorMode = $("select[name='"+options.batchHandleErrorModeParamName+"']", this.element).val();
			
			var param = {};
			
			if(!isNaN(batchCount) && batchCount >= 0)
			{
				param[options.batchCountParamName] = batchCount;
				param[options.batchHandleErrorModeParamName] = batchHandleErrorMode;
			}
			
			return param;
		},
		
		/**
		 * 是否是批量提交。
		 */
		isBatchSubmit : function()
		{
			var options = this.options;
			
			var batchCount = parseInt($("input[name='"+options.batchCountParamName+"']", this.element).val());
			
			return (batchCount >= 0);
		},
		
		/**
		 * 表单所处的对话框是否设置为钉住。
		 */
		isDialogPinned : function()
		{
			var myDialog = $.getInDialog(this.element);
			
			if(myDialog.length < 1)
				return false;
			
			return $.isDialogPinned(myDialog);
		},
		
		/**
		 * 禁止操作。
		 */
		disableOperation : function()
		{
			$(".form-foot input[type='submit']", this.element).button("disable");
			$(".form-foot input[type='reset']", this.element).button("disable");
		},
		
		/**
		 * 启用操作。
		 */
		enableOperation : function()
		{
			$(".form-foot input[type='submit']", this.element).button("enable");
			$(".form-foot input[type='reset']", this.element).button("enable");
		},
		
		/**
		 * 绘制。
		 */
		_render : function($formHead, $formContent, $formFoot)
		{
			this._renderFormHead($formHead);
			this._renderFormContent($formContent);
			this._renderFormFoot($formFoot);
		},
		
		/**
		 * 绘制表单页头。
		 */
		_renderFormHead : function($formHead)
		{
			
		},
		
		/**
		 * 绘制表单页内容。
		 */
		_renderFormContent : function($formContent)
		{
			var _this = this;
			
			var options = this.options;
			var model = options.model;
			var data = options.data;
			
			var properties = model.properties;
			for(var i=0; i<properties.length; i++)
			{
				var property = properties[i];
				var propName = property.name;
				
				if(this._isIgnorePropertyName(property, i))
					continue;
				
				if($.model.isAbstractedProperty(property))
					throw new Error("TODO");
				
				var itemdiv = $("<div class='form-item' />").appendTo($formContent);
				var labeldiv=$("<div class='form-item-label' />").appendTo(itemdiv);
				var valuediv=$("<div class='form-item-value' />").appendTo(itemdiv);
				
				var displayName = $.model.displayName(property);
				var displayDesc = $.model.displayDesc(property);
				$("<label />").html(displayName).attr("title", (displayDesc || displayName)).appendTo(labeldiv);
				
				if($.model.hasFeatureNotReadable(property))
				{
					labeldiv.addClass("ui-state-disabled");
					$("<input type='text' class='ui-widget ui-widget-content ui-state-disabled' />").appendTo(valuediv).attr("disabled", "disabled");
					continue;
				}
				
				var propertyModel = property.model;
				var propValue = $.model.propertyValue(data, propName);
				
				var propertyWidget = (_this._propertyWidgets[propName] =
				{
					property : property,
					
					value : propValue,
					
					getValue : function()
					{
						return this.value;
					},
					
					setValue : function(value)
					{
						this.value = value;
					}
				});
				
				//多元属性
				if($.model.isMultipleProperty(property))
				{
					this._renderMultiplePropertyFormElement(property, propValue, itemdiv, labeldiv, valuediv, propertyWidget);
				}
				//单元基本属性
				else if($.model.isPrimitiveModel(propertyModel))
				{
					if($.model.hasFeatureSelect(property))
					{
						this._renderSinglePrimitivePropertySelectFormElement(property, propValue, itemdiv, labeldiv, valuediv, propertyWidget);
					}
					else if($.model.isFileTypeModel(propertyModel))
					{
						this._renderSinglePrimitivePropertyFileFormElement(property, propValue, itemdiv, labeldiv, valuediv, propertyWidget);
					}
					else
					{
						this._renderSinglePrimitivePropertyTextFormElement(property, propValue, itemdiv, labeldiv, valuediv, propertyWidget);
					}
				}
				//单元复合属性
				else
				{
					this._renderSingleCompositePropertyFormElement(property, propValue, itemdiv, labeldiv, valuediv, propertyWidget);
				}
			}
		},

		/**
		 * 绘制表单页脚。
		 */
		_renderFormFoot : function($formFoot)
		{
			var _this = this;
			
			var options = this.options;
			
			if(options.readonly)
			{
				_this.element.submit(function(){ return false; });
			}
			else
			{
				var $formOperation = $("<div class='form-operation' />").appendTo($formFoot);
				
				if(options.batchSet)
				{
					$formOperation.addClass("form-operation-batch-set");
					
					var $batchSetPanel = $("<div class='batch-set-panel' />").appendTo($formOperation);
					
					$("<label />").html(options.labels.batchSet.batchCount).appendTo($batchSetPanel);
					$("<input type='text' name='"+options.batchCountParamName+"' class='batch-set-count ui-widget ui-widget-content ui-corner-all' />").appendTo($batchSetPanel);
					
					$("<label />").html(options.labels.batchSet.batchHandleErrorMode).appendTo($batchSetPanel);
					var $errorModeSelect = $("<select name='"+options.batchHandleErrorModeParamName+"' class='ui-widget ui-widget-content ui-corner-all' />").appendTo($batchSetPanel);
					for(var i=0; i<options.batchHandleErrorModeEnum.length; i++)
						$("<option />").attr("value", options.batchHandleErrorModeEnum[i])
							.html(options.labels.batchSet.batchHandleErrorModeEnum[i]).appendTo($errorModeSelect);
					
					var batchSetPanelWidth = $batchSetPanel.outerWidth();
					$batchSetPanel.css("left", (0-batchSetPanelWidth - 4.1*2)+"px").hide();
					
					var $batchSetSwitch = $("<span class='batch-set-switch ui-icon ui-icon-gear'></span>").attr("title", options.labels.batchSet.batchSetSwitchTitle).appendTo($formOperation);
					
					$batchSetSwitch.click(function()
					{
						$batchSetPanel.toggle();
					});
				}
				
				var submitbtn = $("<input type='submit' class='recommended' />").attr("value", _this.options.labels.submit).appendTo($formOperation).button();
				var resetbtn = $("<input type='reset' />").attr("value", _this.options.labels.reset).appendTo($formOperation).button();
				
				var validateOptions = _this._getValidateOptions();
				validateOptions.submitHandler = function(form, event)
				{
					var doSubmit = (_this.options.submit.call(_this.element, submitbtn) != false);
					
					if(doSubmit)
						form.submit();
				};
				
				_this.element.validate(validateOptions);
				
				resetbtn.click(function()
				{
					if(_this.options.reset.call(_this.element, resetbtn) != false)
					{
						_this.element.validate().resetForm();
					}
				});
			}
		},
		
		/**
		 * 渲染多选属性表单元素。
		 */
		_renderMultiplePropertyFormElement : function(property, propValue, itemdiv, labeldiv, valuediv, propertyWidget)
		{
			valuediv.addClass("multiple-value");
			
			var _this = this;
			var options = this.options;
			var propName = property.name;
			
			var button=$("<input type='button' />").attr("__propertyName", propName);
			
			button.attr("value", (options.readonly ? options.labels.view : options.labels.edit));
			
			if(options.readonly && (!propValue || !propValue.size || propValue.size==0))
				button.attr("disabled", true);
			else
			{
				button.click(function()
				{
		    		var myPropertyName = $(this).attr("__propertyName");
					var myPropertyInfo = _this._getPropertyInfo(myPropertyName);
					
					if(_this.options.readonly)
					{
						_this.options.viewMultiplePropertyValue.call(_this.element, myPropertyInfo.property,
								myPropertyInfo.propertyModel, myPropertyInfo.propertyValue);
					}
					else
					{
						_this.options.editMultiplePropertyValue.call(_this.element, myPropertyInfo.property,
								myPropertyInfo.propertyModel, myPropertyInfo.propertyValue);
					}
				});
			}
			
			button.appendTo(valuediv).button();
		},
		
		/**
		 * 渲染下拉选择框表单元素。
		 */
		_renderSinglePrimitivePropertySelectFormElement : function(property, propValue, itemdiv, labeldiv, valuediv, propertyWidget)
		{
			valuediv.addClass("select-value");
			
			var options = this.options;
			var propName = property.name;
			
			var select=$.model.featureSelect(property);
			var selectOptions=select.options;
			
			var selectele=$("<select class='ui-widget ui-widget-content' />").attr("name", propName).appendTo(valuediv);
			
			for(var i=0; i<selectOptions.length; i++)
			{
				$("<option />").attr("value", i).text($.model.text(selectOptions[i].label)).appendTo(selectele);
			}
			
			propertyWidget.selectele = selectele[0];
			
			propertyWidget.getValue = function()
			{
				var optionIndex = parseInt($(this.selectele).val());
				return $.model.featureSelect(this.property).options[optionIndex].value;
			};
			propertyWidget.setValue = function(value)
			{
				$(this.selectele).val($.model.optionIndex($.model.featureSelect(this.property), value));
			};
			
			this._addValidatorRequired(property, propName);
		},
		
		/**
		 * 渲染文件上传表单元素。
		 */
		_renderSinglePrimitivePropertyFileFormElement : function(property, propValue, itemdiv, labeldiv, valuediv, propertyWidget)
		{
			valuediv.addClass("file-value");
			
			var _this = this;
			var options = this.options;
			var propName = property.name;
			
			var fileInputShowName = "showNameOf" + propName;
			
			var fileInputHidden = $("<input type='hidden' />").attr("name", propName)
				.val("").appendTo(valuediv);
			
			var fileInputShow = $("<input type='text' class='ui-widget ui-widget-content file-input-show' />").attr("name", fileInputShowName)
				.val("").attr("__propertyName", propName).appendTo(valuediv).attr("readonly", "readonly");
			
			if(options.readonly)
			{
				var fileDownloadButton = $("<button class='download-button' />").attr("__propertyName", propName)
					.html(options.labels.downloadFile)
					.appendTo(valuediv);
				
				var rawValue = $.model.getShowableRawValue(propValue);
				
				if(!rawValue)
					fileDownloadButton.attr("disabled", true);
				
				fileDownloadButton.button();
				
				fileDownloadButton.click(function()
				{
		    		var myPropertyName = $(this).attr("__propertyName");
					var myPropertyInfo = _this._getPropertyInfo(myPropertyName);
					
	    			_this.options.downloadSinglePropertyValueFile.call(_this.element, myPropertyInfo.property,
							myPropertyInfo.propertyModel, myPropertyInfo.propertyValue);
				});
			}
			else
			{
				fileInputShow.keydown(function(event)
				{
					//Backspace删除属性值
					if(event.keyCode == $.ui.keyCode.BACKSPACE)
					{
						var propName = $(this).attr("__propertyName");
						var propertyWidget = _this._propertyWidgets[propName];
						
						propertyWidget.setValue(null);
					}
				});
				
				var actionGroup = $("<div class='property-action-group' />").appendTo(valuediv);
				
				var fileUploadButton = $("<div class='fileinput-button' />").appendTo(actionGroup);
				fileUploadButton.html(options.labels.uploadFile);
				
				var fileInput=$("<input type='file' />").appendTo(fileUploadButton);
				
				var fileInfoDiv = $("<div class='file-info' />").appendTo(valuediv);
				
				fileInput.fileupload(
				{
					__propertyName : propName,
					__propValue : propValue,
					url : options.filePropertyUploadURL,
					paramName : options.filePropertyUploadParamName,
					success : function(serverFileInfo, textStatus, jqXHR)
					{
						var clientFileName = this.files[0].name;
						
						var propName = this.__propertyName;
						var propValue = this.__propValue;
						var propertyWidget = _this._propertyWidgets[propName];
						
						propertyWidget.setValue($.model.toShowableValue(serverFileInfo.name, clientFileName), true);
						
						$.fileuploadsuccessHandlerForUploadInfo(fileInfoDiv);
						
						$("<span class='ui-state-default ui-corner-all file-delete'><span class='ui-icon ui-icon-close'></span></span>")
						.appendTo(fileInfoDiv)
						.click(function()
						{
							var serverFileName = fileInputHidden.val();
							
							//恢复初值
							propertyWidget.setValue(propValue);
							
							if(serverFileInfo.name)
							{
								var param = {};
								param[options.filePropertyDeleteParamName] = serverFileInfo.name;
								
								$.post(options.filePropertyDeleteURL, param);
							}
						});
					}
				})
				.bind('fileuploadadd', function (e, data)
				{
					$.fileuploadaddHandlerForUploadInfo(e, data, fileInfoDiv);
				})
				.bind('fileuploadprogressall', function (e, data)
				{
					$.fileuploadprogressallHandlerForUploadInfo(e, data, fileInfoDiv);
				});
				
				var moreActionSelect = $("<select />").appendTo(actionGroup);
				var downloadOption = $("<option value='download' />").attr("__propertyName", propName).html(options.labels.downloadFile).appendTo(moreActionSelect);
				var delOption = $("<option value='del' />").attr("__propertyName", propName).html(options.labels.del).appendTo(moreActionSelect);
				moreActionSelect.selectmenu(
				{
					appendTo: valuediv,
					classes:
					{
				          "ui-selectmenu-button": "ui-button-icon-only splitbutton-select"
				    },
				    select: function(event, ui)
			    	{
			    		var action = $(ui.item).attr("value");
			    		var myPropertyName = $(ui.item.element).attr("__propertyName");
						var myPropertyInfo = _this._getPropertyInfo(myPropertyName);
						
			    		if("download" == action)
			    		{
			    			var rawValue = $.model.getShowableRawValue(myPropertyInfo.propertyValue);
			    			
			    			if(rawValue)
			    				_this.options.downloadSinglePropertyValueFile.call(_this.element, myPropertyInfo.property,
										myPropertyInfo.propertyModel, myPropertyInfo.propertyValue);
			    		}
			    		else if("del" == action)
			    		{
			    			_this.options.deleteSinglePropertyValue.call(_this.element, myPropertyInfo.property,
									myPropertyInfo.propertyModel, myPropertyInfo.propertyValue);
			    		}
			    	}
				});
				
				actionGroup.controlgroup({"items" : {"button" : "div"}});
				
				propertyWidget.fileInfoDiv = fileInfoDiv[0];
			}
			
			propertyWidget.fileInputHidden = fileInputHidden[0];
			propertyWidget.fileInputShow = fileInputShow[0];
			
			propertyWidget.getValue = function()
			{
				if(options.filePropertyReturnShowableValue)
					return $.model.toShowableValue($(this.fileInputHidden).val(), $(this.fileInputShow).val());
				else
					return $(this.fileInputHidden).val();
			};
			propertyWidget.setValue = function(value, reserveFileInfo)
			{
				var rawValue = $.model.getShowableRawValue(value);
				var labelValue = $.model.getShowableLabelValue(value);
				
				$(this.fileInputHidden).val(rawValue ? rawValue : "");
				
				if(labelValue)
					$(this.fileInputShow).val(labelValue);
				else
					$(this.fileInputShow).val((rawValue ? rawValue : ""));
				
				if(this.fileInfoDiv)
				{
					if(reserveFileInfo)
						;
					else
						$(this.fileInfoDiv).empty();
				}
			};
			
			propertyWidget.setValue(propValue);
			
			this._addValidatorRequired(property, fileInputShowName);
		},
		
		/**
		 * 渲染文本框表单元素。
		 */
		_renderSinglePrimitivePropertyTextFormElement : function(property, propValue, itemdiv, labeldiv, valuediv, propertyWidget)
		{
			var options = this.options;
			var propName = property.name;
			
			var propertyModelType = $.model.getModelType(property.model);
			
			var textinput;
			
			var maxLengthFeature = $.model.featureMaxLength(property);
			var maxLength = (maxLengthFeature ? maxLengthFeature.value : undefined);
			
			if(maxLength && maxLength > options.asTextareaLength)
			{
				valuediv.addClass("textarea-value");
				
				textinput = $("<textarea class='ui-widget ui-widget-content' />").attr("name", propName)
					.text((propValue == undefined || propValue == null) ? "" : propValue);
			}
			else
			{
				valuediv.addClass("text-value");
				
				textinput = $("<input type='text' class='ui-widget ui-widget-content' />").attr("name", propName)
					.val((propValue == undefined || propValue == null) ? "" : propValue);
			}
			
			if(options.readonly)
				textinput.attr("readonly", true);

			var dateFormat = "";
			
			if(!options.readonly)
			{
				if("Date" == propertyModelType)
					dateFormat = options.dateFormat;
				else if("Timestamp" == propertyModelType)
					dateFormat = options.timestampFormat;
				else if("Time" == propertyModelType)
					dateFormat = options.timeFormat;
			}
			
			textinput.appendTo(valuediv);
			
			if(dateFormat)
				textinput.after("<div class='input-desc input-desc-date ui-state-disabled'>"+dateFormat+"</div>");
			
			propertyWidget.textinput = textinput[0];
			
			propertyWidget.getValue = function()
			{
				return $(this.textinput).val();
			};
			propertyWidget.setValue = function(value)
			{
				$(this.textinput).val(value);
			};
			
			this._addValidatorRequired(property, propName);
		},
		
		/**
		 * 渲染单元复合属性表单元素。
		 */
		_renderSingleCompositePropertyFormElement : function(property, propValue, itemdiv, labeldiv, valuediv, propertyWidget)
		{
			valuediv.addClass("single-value");
			
			var _this = this;
			var options = this.options;
			var model = options.model;
			var propName = property.name;
			
			var textinputName = "tokenOf" + propName;
			
			var textinput=$("<input type='text' class='ui-widget ui-widget-content' />").attr("name", textinputName).attr("readonly", true)
							.val($.model.tokenProperty(property, propValue)).appendTo(valuediv);
			
			var button=$("<input type='button' />").attr("__propertyName", propName);
			
			//只读
			if(options.readonly)
			{
				button.attr("value", options.labels.view);
				
				if(!propValue)
					button.attr("disabled", true);
				else
				{
					button.click(function()
					{
			    		var myPropertyName = $(this).attr("__propertyName");
						var myPropertyInfo = _this._getPropertyInfo(myPropertyName);
						
						_this.options.viewSinglePropertyValue.call(_this.element, myPropertyInfo.property,
								myPropertyInfo.propertyModel, myPropertyInfo.propertyValue);
					});
				}
				
				button.attr("value", _this.options.labels.view).appendTo(valuediv).button();
			}
			//可编辑
			else
			{
				textinput.attr("__propertyName", propName).keydown(function(event)
				{
					//Backspace删除属性值
					if(event.keyCode == $.ui.keyCode.BACKSPACE)
					{
			    		var myPropertyName = $(this).attr("__propertyName");
						var myPropertyInfo = _this._getPropertyInfo(myPropertyName);
						
						_this.options.deleteSinglePropertyValue.call(_this.element, myPropertyInfo.property,
								myPropertyInfo.propertyModel, myPropertyInfo.propertyValue);
					}
				});
				
				var actionGroup = $("<div class='property-action-group' />");
				button.appendTo(actionGroup);
				var moreActionSelect = $("<select />").appendTo(actionGroup);
				
				//私有属性
				if($.model.isPrivatePropertyModel(model, property, property.model))
				{
					button.attr("value", options.labels.edit).click(function()
					{
			    		var myPropertyName = $(this).attr("__propertyName");
						var myPropertyInfo = _this._getPropertyInfo(myPropertyName);
						
						//属性值必须动态判断，因为界面编辑时也可能设置值
						if(myPropertyInfo.propertyValue != null)
						{
							_this.options.editSinglePropertyValue.call(_this.element, myPropertyInfo.property,
									myPropertyInfo.propertyModel, myPropertyInfo.propertyValue);
						}
						else
						{
							_this.options.addSinglePropertyValue.call(_this.element, myPropertyInfo.property,
									myPropertyInfo.propertyModel);
						}
					});
				}
				//公有字段
				else
				{
					button.attr("value", options.labels.select).click(function()
					{
			    		var myPropertyName = $(this).attr("__propertyName");
						var myPropertyInfo = _this._getPropertyInfo(myPropertyName);
						
						_this.options.selectSinglePropertyValue.call(_this.element, myPropertyInfo.property,
								myPropertyInfo.propertyModel, myPropertyInfo.propertyValue);
					});
				}
				
				var delOption = $("<option value='del' />").attr("__propertyName", propName).html(_this.options.labels.del).appendTo(moreActionSelect);
				
				actionGroup.appendTo(valuediv);
				moreActionSelect.selectmenu(
				{
					appendTo: valuediv,
					classes:
					{
				          "ui-selectmenu-button": "ui-button-icon-only splitbutton-select"
				    },
				    select: function(event, ui)
			    	{
			    		var action = $(ui.item).attr("value");
			    		var myPropertyName = $(ui.item.element).attr("__propertyName");
						var myPropertyInfo = _this._getPropertyInfo(myPropertyName);
			    		
						if("del" == action)
			    		{
			    			_this.options.deleteSinglePropertyValue.call(_this.element, myPropertyInfo.property,
			    					myPropertyInfo.propertyModel, myPropertyInfo.propertyValue);
			    		}
			    	}
				});
				actionGroup.controlgroup();
			}
			
			propertyWidget.textinput = textinput[0];
			propertyWidget.button = button[0];
			
			propertyWidget.setValue = function(value)
			{
				$(this.textinput).val($.model.tokenProperty(this.property, value));
				this.value = value;
			}
			
			this._addValidatorRequired(property, textinputName);
		},
		
		_getPropertyInfo : function(propertyName)
		{
			var property = $.model.getProperty(this.options.model, propertyName);
			var propertyWidget = this._propertyWidgets[propertyName];
			var propertyValue = propertyWidget.getValue();
			var propertyModel = $.model.getPropertyModelByValue(property, propertyValue);
			
			var propertyInfo = 
			{
				"property" : property,
				"propertyWidget" : propertyWidget,
				"propertyValue" : propertyValue,
				"propertyModel" : propertyModel
			};
			
			return propertyInfo;
		},
		
		/**
		 * 判断属性是否是忽略属性。
		 */
		_isIgnorePropertyName : function(property, propertyIndex)
		{
			var ignore = $.model.containsOrEquals(this.options.ignorePropertyNames, property.name);
			
			if(!ignore)
				ignore = (this.options.renderProperty.call(this, property, propertyIndex) == false);
			
			return ignore;
		},
		
		/**
		 * 添加required验证规则。
		 */
		_addValidatorRequired : function(property, inputName)
		{
			if($.model.hasFeatureNotNull(property))
			{
				if(this.options.validationRequiredAsAdd
						&& ($.model.hasFeatureAutoGenerated(property) || $.model.hasFeatureValueGenerator(property)))
				{
					return false;
				}
				else
				{
					this._addValidator(inputName, "required", this.options.labels.validation.required);
					
					return true;
				}
			}
			else
				return false;
		},
		
		/**
		 * 添加验证规则
		 */
		_addValidator : function(name, rule, message)
		{
			var validateOptions = this._getValidateOptions();
			
			validateOptions.rules[name] = rule;
			
			if(message)
				validateOptions.messages[name] = message;
		},
		
		/**
		 * 获取验证选项。
		 */
		_getValidateOptions : function()
		{
			var validateOptions = (this.validateOptions || (this.validateOptions = 
				{
					rules : {},
					messages : {},
					errorPlacement : function(error, element)
					{
						error.appendTo(element.closest(".form-item-value"));
					}
				}
			));
			
			var rules = (validateOptions.rules || (validateOptions.rules = {}));
			rules[this.options.batchCountParamName] = { "number" : true, "min" : 0 };
			
			return validateOptions;
		}
	});
})
(jQuery);
