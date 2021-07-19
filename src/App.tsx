import React, { useEffect, useState } from 'react';
import SortableTree from "react-sortable-tree";
import './../node_modules/react-sortable-tree/style.css';
import { PlusCircleOutlined } from "@ant-design/icons"
import { Button, message, Modal } from 'antd';
import "./style.scss"
import 'antd/dist/antd.css';
const axios = require('axios');
const URL = "http://localhost:4000/"

type catagory = {
    price: number;
    root: Boolean;
    title: String;
    children: [];
    _id: String;
}

const App = () => {

    const [catagory, setCatagory] = useState<catagory[]>([]);
    const [catagoryPrice, setCatagoryPrice] = useState<number[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<Boolean | any>();
    const [node, setNode] = useState<catagory>();
    const [catagoryData, setCatagoryData] = useState<{ title?: any, price?: any }>();
    const [forUpdate, setforUpdate] = useState<Boolean>(false);

    useEffect(() => {
        getAllCatagory();
    }, [])

    const getAllCatagory = async () => {
        const { data } = await axios.get(URL + "getallcatagorys")
        setCatagory(data.AllCatagorys);
    }

    useEffect(() => {
        catagory.map(async ({ _id }, i) => {
            let newPrice = catagoryPrice;
            newPrice[i] = await getPrice(_id, i)
            setCatagoryPrice([...newPrice]);
        })
    }, [catagory])

    const getPrice = async (id: String, i: any) => {
        const { data } = await axios.get(URL + "countCatagoryAmount?catagoryID=" + id)
        return data?.TotalAmountOfCatagory;
    }

    const addSubCatagory = async (node: catagory) => {
        setIsModalVisible(true);
        setNode(node);
    }

    const onOk = async () => {
        if (catagoryData?.title) {
            if (forUpdate) {
                const { data } = await axios.post(URL + "addcatagory", { title: catagoryData?.title, price: catagoryData?.price || 0 })
                await getAllCatagory();
                setIsModalVisible(false);
            } else {
                const { data } = await axios.post(URL + "addcatagory", { catagoryID: node?._id, title: catagoryData?.title, price: catagoryData?.price || 0 })
                await getAllCatagory();
                setIsModalVisible(false);
            }
        } else message.error("Provide both field!");
    }

    const setCatagoryValue = (name: any, value: any): void => {
        setCatagoryData({ ...catagoryData, [name]: value })
    }

    const customData = (catagory: catagory[]) => {
        let NewCatagory = catagory.map((value, i) => ({ ...value, subtitle: `\nTotal Price:- ${catagoryPrice[i]}` }))
        return NewCatagory
    }

    return (
        <div className="category" >
            <div className="title-text">
                <p>Catagory management</p>
                <Button onClick={() => {
                    setforUpdate(true)
                    setIsModalVisible(true)
                }}>Add New Catagory</Button>
            </div>
            <SortableTree
                isVirtualized={false}
                treeData={customData(catagory)}
                canDrag={false}
                generateNodeProps={(rowInfo: any) => {
                    const { node } = rowInfo;
                    return {
                        buttons: [
                            <Button
                                className="btn btn-outline-success"
                                style={{
                                    verticalAlign: "middle"
                                }}
                                onClick={() => {
                                    setforUpdate(false)
                                    addSubCatagory(node)
                                }}
                            ><PlusCircleOutlined /></Button>
                        ]
                    };
                }}
                onChange={(e: any) => setCatagory(e)}
            />
            <Modal className="addCatagory" title="Add Catagory" visible={isModalVisible} onOk={onOk} okText="Save Catagory" onCancel={() => setIsModalVisible(false)}>
                <div className="field-set">
                    <div className="field-set-box">
                        <label htmlFor="">Title :- </label>
                        <input type="text" value={catagoryData?.title} name="title" onChange={({ target }) => setCatagoryValue(target.name, target.value)} />
                    </div>
                    <div className="field-set-box">
                        <label htmlFor="">Price :- </label>
                        <input type="number" value={catagoryData?.price} name="price" onChange={({ target }) => setCatagoryValue(target.name, target.value)} />
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default App;