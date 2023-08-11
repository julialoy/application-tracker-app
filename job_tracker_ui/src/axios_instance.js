// Allows base Axios configuration to be shared throughout frontend
// Based on and adapted from this tutorial: https://dev.to/ndrohith/creating-an-axios-instance-5b4n
import axios from 'axios';

export const axInst = axios.create({
    baseURL: 'http://ec2-44-215-13-166.compute-1.amazonaws.com:5000/api/',
    headers: {
        'Content-Type': 'application/json',
    }
});

export default axInst;