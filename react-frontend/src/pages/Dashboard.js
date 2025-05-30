import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Button,
  Center,
  Spinner,
  HStack,
  Icon,
  Heading,
  Divider,
  Card,
  CardBody,
  useToast,
  Flex,
  Spacer,
  IconButton,
  Select,
} from "@chakra-ui/react";
import { CheckCircle, Truck, Clock, Repeat } from "lucide-react";
import { fetchOrders, approvePO, orderPO } from "../api";
import KPICards from "./KPICards";

const statusMap = {
  PENDING: { label: "Pending", color: "yellow.600", icon: Clock },
  APPROVED: { label: "Approved", color: "blue.600", icon: CheckCircle },
  ORDERED: { label: "Ordered", color: "green.600", icon: Truck },
};

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadOrders = () => {
    setLoading(true);
    fetchOrders()
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleApprove = async (id) => {
    await approvePO(id);
    toast({ title: "PO Approved", status: "success", duration: 2000 });
    loadOrders();
  };

  const handleOrder = async (id) => {
    await orderPO(id);
    toast({ title: "PO Marked as Ordered", status: "success", duration: 2000 });
    loadOrders();
  };

  // filter orders based on status
  const filteredOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter((po) => po.status === statusFilter);

  return (
    <Box p={0} bg="gray.50" minH="100vh">
      <Box maxW="" mx="auto">
        <Box
          bg="gray.100"
          px={6}
          py={4}
          borderBottom="1px solid"
          borderColor="gray.200"
          mb={6}
        >
          <Flex align="center">
            <Box>
              <Heading size="md" mb={1} color="gray.800">
                Purchase Order Dashboard
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Review, Approve, and Track Purchase Orders
              </Text>
            </Box>

            <Spacer />

            {/* Optional Action Buttons */}
            <Flex gap={2}>
              <IconButton
                icon={<Repeat size={18} />}
                aria-label="Refresh"
                variant="ghost"
                colorScheme="gray"
              />
              <Button colorScheme="blue" size="sm">
                Create PO
              </Button>
            </Flex>
          </Flex>
        </Box>

        <KPICards />
        <Card borderRadius="xl" shadow="md">
          <CardBody>
            {loading ? (
              <Center py={10}>
                <Spinner size="lg" />
              </Center>
            ) : (
              <>
                <Divider mb={4} />
                <Table variant="simple" size="md">
                  <Thead bg="gray.100">
                    <Tr>
                      <Th>PO Title</Th>
                      <Th>
                        <HStack>
                          <Text>Status</Text>
                          <Select
                            size="xs"
                            width="120px"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <option value="ALL">All</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="ORDERED">Ordered</option>
                          </Select>
                        </HStack>
                      </Th>
                      <Th textAlign="center">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {orders.length > 0 ? (
                      filteredOrders?.map((po) => {
                        const status = statusMap[po.status];
                        return (
                          <Tr key={po.ID} _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="medium">{po.title}</Td>
                            <Td>
                              <HStack
                                color={status.color}
                                fontWeight="semibold"
                              >
                                <Icon as={status.icon} boxSize={4} />
                                <Text>{status.label}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <HStack justify="center">
                                {po.status === "PENDING" && (
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={() => handleApprove(po.ID)}
                                  >
                                    Approve
                                  </Button>
                                )}
                                {po.status === "APPROVED" && (
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    onClick={() => handleOrder(po.ID)}
                                  >
                                    Mark Ordered
                                  </Button>
                                )}
                                {po.status === "ORDERED" && (
                                  <Text fontSize="sm" color="gray.500">
                                    Completed
                                  </Text>
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })
                    ) : (
                      <Tr>
                        <Td colSpan={3}>
                          <Center py={6}>
                            <Text color="gray.500">
                              No purchase orders found.
                            </Text>
                          </Center>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </>
            )}
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
