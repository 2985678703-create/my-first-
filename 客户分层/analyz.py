import pandas as pd

def process_retail_data(file_path):
    print(">>> 1. 正在加载数据...")
    df = pd.read_excel(file_path, sheet_name='Online Retail')
    
    print(f"原始数据总行数: {len(df):,}")
    
    # 1. 数据清洗：剔除 Quantity 为 0 或负数的无效数据
    df_clean = df[df['Quantity'] > 0].copy()
    print(f"清洗无效数据（Quantity <= 0）后剩余行数: {len(df_clean):,}")
    
    # 2. 新增 total price 列（Quantity * UnitPrice）
    df_clean['TotalPrice'] = df_clean['Quantity'] * df_clean['UnitPrice']
    
    # 3. 排序规则：按 TotalPrice 降序；若价值一样，按 InvoiceDate 升序（越早越前）
    df_clean = df_clean.sort_values(
        by=['TotalPrice', 'InvoiceDate'], 
        ascending=[False, True]
    )
    
    # 保存清洗并排序后的全量表格
    output_all_path = 'cleaned_retail_data.xlsx'
    df_clean.to_excel(output_all_path, index=False)
    print(f"清洗后的全量表格已保存至: {output_all_path}")
    
    # 4. 提取高净值客户名单（约 200 人）
    # 确保 StockCode 为字符串以便进行统计
    df_clean['StockCode'] = df_clean['StockCode'].astype(str)
    
    customer_summary = df_clean.groupby('CustomerID').agg(
        Total_Spend=('TotalPrice', 'sum'),
        Total_Quantity=('Quantity', 'sum'),
        Order_Count=('InvoiceNo', 'nunique'),
        Country=('Country', 'first'),
        First_InvoiceDate=('InvoiceDate', 'min'),
        Last_InvoiceDate=('InvoiceDate', 'max'),
        Top_StockCode=('StockCode', lambda x: x.mode()[0] if not x.empty else '')
    ).reset_index()
    
    # 按总消费金额由大到小对客户排序
    customer_summary = customer_summary.sort_values(by='Total_Spend', ascending=False)
    
    # 取前 200 名高净值客户
    top_200 = customer_summary.head(200)
    
    output_hnw_path = 'top_200_high_net_worth_customers.xlsx'
    top_200.to_excel(output_hnw_path, index=False)
    print(f"Top 200 高净值客户名单已保存至: {output_hnw_path}")
    
    return df_clean, top_200

if __name__ == '__main__':
    # 确保 'Online Retail.xlsx' 在同级目录下
    cleaned_df, top_200_df = process_retail_data('Online Retail.xlsx')
    print("\n=== Top 5 高净值客户预览 ===")
    print(top_200_df.head(5).to_string())