/*
 * Copyright (c) 2018 datagear.tech. All Rights Reserved.
 */

package org.datagear.analysis;

/**
 * 数据集工厂。
 * 
 * @author datagear@163.com
 *
 */
public interface DataSetFactory extends Identifiable
{
	/**
	 * 获取{@linkplain DataSetParams}。
	 * <p>
	 * 返回{@code null}表示没有。
	 * </p>
	 * 
	 * @return
	 */
	DataSetParams getParams();

	/**
	 * 获取{@linkplain DataSetExports}。
	 * <p>
	 * 返回{@code null}表示没有。
	 * </p>
	 * 
	 * @return
	 */
	DataSetExports getExports();

	/**
	 * 获取{@linkplain DataSet}。
	 * 
	 * @param dataSetParamValues
	 * @return
	 * @throws DataSetException
	 */
	DataSet getDataSet(DataSetParamValues dataSetParamValues) throws DataSetException;
}
