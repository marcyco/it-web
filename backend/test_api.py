"""
API测试脚本
用于测试后端API的基本功能
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"

def print_response(response, title):
    """打印API响应"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"状态码: {response.status_code}")
    print(f"响应内容:")
    try:
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except:
        print(response.text)

def test_health():
    """测试健康检查"""
    print("\n测试健康检查...")
    response = requests.get(f"{BASE_URL}/health")
    print_response(response, "健康检查")

def test_register():
    """测试用户注册"""
    print("\n测试用户注册...")
    data = {
        "username": f"testuser_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "email": f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com",
        "password": "password123"
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
    print_response(response, "用户注册")
    return response.json()

def test_login(username, password):
    """测试用户登录"""
    print("\n测试用户登录...")
    data = {
        "username": username,
        "password": password
    }
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    print_response(response, "用户登录")
    return response.json()

def test_create_experiment(token):
    """测试创建实验"""
    print("\n测试创建实验...")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "name": "测试实验",
        "description": "这是一个测试实验",
        "parameters": {
            "source_ip": "192.168.1.1",
            "destination_ip": "192.168.1.2",
            "source_port": 12345,
            "destination_port": 80,
            "protocol": "tcp",
            "config": {
                "port": 8080,
                "mtu": 1500,
                "window_size": 65535,
                "timeout": 30,
                "delay": 0,
                "packet_loss": 0.0,
                "reordering": 0.0
            }
        }
    }
    response = requests.post(f"{BASE_URL}/api/experiments", json=data, headers=headers)
    print_response(response, "创建实验")
    return response.json()

def test_get_experiments(token):
    """测试获取实验列表"""
    print("\n测试获取实验列表...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/experiments", headers=headers)
    print_response(response, "获取实验列表")
    return response.json()

def test_start_experiment(token, experiment_id):
    """测试启动实验"""
    print("\n测试启动实验...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/api/experiments/{experiment_id}/start", headers=headers)
    print_response(response, "启动实验")

def test_get_protocol_stack_status(token, experiment_id):
    """测试获取协议栈状态"""
    print("\n测试获取协议栈状态...")
    headers = {"Authorization": f"Bearer {token}"}
    params = {"experiment_id": experiment_id}
    response = requests.get(f"{BASE_URL}/api/protocol/stack/status", headers=headers, params=params)
    print_response(response, "获取协议栈状态")

def test_send_packet(token, experiment_id):
    """测试发送数据包"""
    print("\n测试发送数据包...")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "experiment_id": experiment_id,
        "payload": "测试数据包"
    }
    response = requests.post(f"{BASE_URL}/api/protocol/stack/send", json=data, headers=headers)
    print_response(response, "发送数据包")

def test_get_packets(token, experiment_id):
    """测试获取数据包列表"""
    print("\n测试获取数据包列表...")
    headers = {"Authorization": f"Bearer {token}"}
    params = {"experiment_id": experiment_id}
    response = requests.get(f"{BASE_URL}/api/packets", headers=headers, params=params)
    print_response(response, "获取数据包列表")

def test_enable_fault(token, experiment_id):
    """测试启用故障模拟"""
    print("\n测试启用故障模拟...")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "experiment_id": experiment_id,
        "fault_type": "packet_loss",
        "enabled": True,
        "parameters": {
            "loss_rate": 0.1
        }
    }
    response = requests.post(f"{BASE_URL}/api/protocol/faults", json=data, headers=headers)
    print_response(response, "启用故障模拟")

def test_get_faults(token, experiment_id):
    """测试获取故障模拟列表"""
    print("\n测试获取故障模拟列表...")
    headers = {"Authorization": f"Bearer {token}"}
    params = {"experiment_id": experiment_id}
    response = requests.get(f"{BASE_URL}/api/protocol/faults", headers=headers, params=params)
    print_response(response, "获取故障模拟列表")

def test_get_experiment_metrics(token, experiment_id):
    """测试获取实验指标"""
    print("\n测试获取实验指标...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/experiments/{experiment_id}/metrics", headers=headers)
    print_response(response, "获取实验指标")

def test_stop_experiment(token, experiment_id):
    """测试停止实验"""
    print("\n测试停止实验...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/api/experiments/{experiment_id}/stop", headers=headers)
    print_response(response, "停止实验")

def main():
    """主测试函数"""
    print("="*60)
    print("网络协议栈可视化教学平台 - API测试")
    print("="*60)
    
    try:
        # 测试健康检查
        test_health()
        
        # 测试用户注册
        register_result = test_register()
        
        if register_result.get('success'):
            username = register_result['data']['username']
            password = "password123"
            
            # 测试用户登录
            login_result = test_login(username, password)
            
            if login_result.get('success'):
                token = login_result['data']['access_token']
                
                # 测试创建实验
                experiment_result = test_create_experiment(token)
                
                if experiment_result.get('success'):
                    experiment_id = experiment_result['data']['id']
                    
                    # 测试获取实验列表
                    test_get_experiments(token)
                    
                    # 测试启动实验
                    test_start_experiment(token, experiment_id)
                    
                    # 测试获取协议栈状态
                    test_get_protocol_stack_status(token, experiment_id)
                    
                    # 测试发送数据包
                    test_send_packet(token, experiment_id)
                    
                    # 测试获取数据包列表
                    test_get_packets(token, experiment_id)
                    
                    # 测试启用故障模拟
                    test_enable_fault(token, experiment_id)
                    
                    # 测试获取故障模拟列表
                    test_get_faults(token, experiment_id)
                    
                    # 测试获取实验指标
                    test_get_experiment_metrics(token, experiment_id)
                    
                    # 测试停止实验
                    test_stop_experiment(token, experiment_id)
                else:
                    print("\n创建实验失败，跳过后续测试")
            else:
                print("\n登录失败，跳过后续测试")
        else:
            print("\n注册失败，跳过后续测试")
            
    except requests.exceptions.ConnectionError:
        print("\n错误: 无法连接到服务器")
        print("请确保后端服务正在运行: python backend/app.py")
    except Exception as e:
        print(f"\n错误: {str(e)}")
    
    print("\n" + "="*60)
    print("测试完成")
    print("="*60)

if __name__ == "__main__":
    main()
