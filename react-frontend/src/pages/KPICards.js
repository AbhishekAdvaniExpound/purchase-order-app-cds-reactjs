import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Text,
  Flex,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import {
  CircleDollarSign,
  ListChecks,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";

export default function KPICards() {
  const [kpi, setKpi] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:4004/rest/purchase-order/getKPIs")
      .then((res) => setKpi(res.data));
  }, []);

  if (!kpi) {
    return (
      <Box p={8}>
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Grid templateColumns={["repeat(2, 1fr)", "repeat(5, 1fr)"]} gap={4}>
        <RoundKPI
          title="Total Orders"
          value={kpi.totalOrders}
          icon={FileText}
        />
        <RoundKPI title="Pending" value={kpi.pendingOrders} icon={Clock} />
        <RoundKPI
          title="Approved"
          value={kpi.approvedOrders}
          icon={CheckCircle}
        />
        <RoundKPI title="Ordered" value={kpi.orderedOrders} icon={ListChecks} />
        <RoundKPI
          title="Total Amount"
          value={`₹${kpi.totalAmount.toLocaleString()}`}
          icon={CircleDollarSign}
        />
      </Grid>
    </Box>
  );
}

function RoundKPI({ title, value, icon }) {
  const bg = useColorModeValue("white", "gray.700");

  return (
    <Flex direction="column" align="center" gap={2}>
      <Box
        boxSize="80px"
        borderRadius="full"
        bg={bg}
        shadow="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {React.createElement(icon, { size: 32, color: "#2D3748" })}
      </Box>
      <Text fontSize="xs" color="gray.500">
        {title}
      </Text>
      <Text fontSize="md" fontWeight="bold" color="gray.800">
        {value}
      </Text>
    </Flex>
  );
}
